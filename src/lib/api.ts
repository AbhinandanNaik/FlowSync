import { createClient } from '@/lib/supabase/client'
import { Board, Column, Task, UniqueId } from '@/types/board'

export const api = {
    // Boards
    async getBoard(id: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Board
    },

    async getColumns(boardId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('columns')
            .select('*')
            .eq('board_id', boardId)
            .order('order', { ascending: true })

        if (error) throw error
        return data.map(col => ({ ...col, boardId: col.board_id })) as Column[]
    },

    async getTasks(columnIds: string[]) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                assignee:assignee_id (email, full_name, avatar_url)
            `)
            .in('column_id', columnIds)
            .order('order', { ascending: true })

        if (error) throw error
        return data.map((task: any) => ({
            ...task,
            columnId: task.column_id,
            assigneeEmail: task.assignee?.email,
            assigneeFullName: task.assignee?.full_name,
            assigneeAvatarUrl: task.assignee?.avatar_url
        })) as Task[]
    },

    // Updates
    async updateTaskPosition(taskId: UniqueId, columnId: UniqueId, newOrder: number) {
        const supabase = createClient()
        const { error } = await supabase
            .from('tasks')
            .update({ column_id: columnId, order: newOrder })
            .eq('id', taskId)

        if (error) throw error
    },

    async updateColumnOrder(columnId: UniqueId, newOrder: number) {
        const supabase = createClient()
        const { error } = await supabase
            .from('columns')
            .update({ order: newOrder })
            .eq('id', columnId)

        if (error) throw error
    },

    // CRUD
    async createColumn(boardId: string, title: string, order: number) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('columns')
            .insert({ board_id: boardId, title, order })
            .select()
            .single()

        if (error) throw error
        return { ...data, boardId: data.board_id } as Column
    },

    async createTask(columnId: string, content: string, order: number, extras?: { due_date?: string | null, priority?: string, assignee_id?: string | null }) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tasks')
            .insert({ column_id: columnId, content, order, ...extras })
            .select()
            .single()

        if (error) throw error
        return { ...data, columnId: data.column_id } as Task
    },

    async updateTask(taskId: UniqueId, updates: { content?: string, description?: string, due_date?: string | null, priority?: string, assignee_id?: string | null }) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single()

        if (error) throw error
        return { ...data, columnId: data.column_id } as Task
    },

    async deleteTask(taskId: UniqueId) {
        const supabase = createClient()
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) throw error
    },

    // Workspaces
    async getWorkspaces() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async createWorkspace(name: string) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { data, error } = await supabase
            .from('workspaces')
            .insert({ name, owner_id: user.id })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getWorkspaceBoards(workspaceId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('boards')
            .select('*')
        if (error) throw error
        return data as any[]
    },

    async inviteMember(workspaceId: string, email: string) {
        const supabase = createClient()
        const { error } = await supabase.rpc('add_member_by_email', {
            target_email: email,
            target_workspace_id: workspaceId
        })

        if (error) throw error
    },

    async getWorkspaceMembers(workspaceId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
            *,
            profiles:user_id (email, full_name, avatar_url)
          `)
            .eq('workspace_id', workspaceId)

        if (error) throw error
        // Flatten the profile data for easier consumption
        return data.map((member: any) => ({
            ...member,
            email: member.profiles?.email,
            fullName: member.profiles?.full_name,
            avatarUrl: member.profiles?.avatar_url
        }))
    },

    // Activity Logs
    async logActivity(workspaceId: string, actionType: string, entityType: string, entityId: string, details: any = {}) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('activity_logs')
            .insert({
                workspace_id: workspaceId,
                user_id: user.id,
                action_type: actionType,
                entity_type: entityType,
                entity_id: entityId,
                details
            })

        if (error) console.error("Failed to log activity:", error)
    },

    async getWorkspaceActivity(workspaceId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('activity_logs')
            .select(`
                *,
                profiles:user_id (email, full_name, avatar_url)
            `)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error
        return data.map((log: any) => ({
            ...log,
            userEmail: log.profiles?.email,
            userFullName: log.profiles?.full_name,
            userAvatarUrl: log.profiles?.avatar_url
        }))
    },

    // ── Task Comments ──────────────────────────────────────────────
    async getTaskComments(taskId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('task_comments')
            .select(`
                *,
                profiles:user_id (email, full_name, avatar_url)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data.map((c: any) => ({
            ...c,
            userEmail: c.profiles?.email,
            userFullName: c.profiles?.full_name,
            userAvatarUrl: c.profiles?.avatar_url
        }))
    },

    async createComment(taskId: string, content: string, parentId?: string | null) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('task_comments')
            .insert({
                task_id: taskId,
                user_id: user.id,
                content,
                parent_id: parentId || null
            })
            .select(`
                *,
                profiles:user_id (email, full_name, avatar_url)
            `)
            .single()

        if (error) throw error
        return {
            ...data,
            userEmail: (data as any).profiles?.email,
            userFullName: (data as any).profiles?.full_name,
            userAvatarUrl: (data as any).profiles?.avatar_url
        }
    },

    async updateComment(commentId: string, content: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('task_comments')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', commentId)

        if (error) throw error
    },

    async deleteComment(commentId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('task_comments')
            .delete()
            .eq('id', commentId)

        if (error) throw error
    },

    // ── Labels ─────────────────────────────────────────────────────
    async getLabels(boardId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('labels')
            .select('*')
            .eq('board_id', boardId)
            .order('name', { ascending: true })

        if (error) throw error
        return data
    },

    async createLabel(boardId: string, name: string, color: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('labels')
            .insert({ board_id: boardId, name, color })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteLabel(labelId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('labels')
            .delete()
            .eq('id', labelId)

        if (error) throw error
    },

    async getTaskLabels(taskIds: string[]) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('task_labels')
            .select('*, labels(*)')
            .in('task_id', taskIds)

        if (error) throw error
        return data
    },

    async addLabelToTask(taskId: string, labelId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('task_labels')
            .insert({ task_id: taskId, label_id: labelId })

        if (error) throw error
    },

    async removeLabelFromTask(taskId: string, labelId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('task_labels')
            .delete()
            .eq('task_id', taskId)
            .eq('label_id', labelId)

        if (error) throw error
    },

    // ── Attachments ────────────────────────────────────────────────
    async uploadAttachment(taskId: string, file: File) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const filePath = `${taskId}/${Date.now()}_${file.name}`

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(filePath, file, { upsert: false })

        if (uploadError) throw uploadError

        // Insert metadata
        const { data, error: insertError } = await supabase
            .from('task_attachments')
            .insert({
                task_id: taskId,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.type || 'application/octet-stream',
                uploaded_by: user.id
            })
            .select()
            .single()

        if (insertError) throw insertError
        return data
    },

    async getAttachments(taskId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('task_attachments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async deleteAttachment(attachmentId: string, filePath: string) {
        const supabase = createClient()

        // Delete from storage
        await supabase.storage
            .from('task-attachments')
            .remove([filePath])

        // Delete metadata
        const { error } = await supabase
            .from('task_attachments')
            .delete()
            .eq('id', attachmentId)

        if (error) throw error
    },

    getAttachmentUrl(filePath: string) {
        const supabase = createClient()
        const { data } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(filePath)

        return data.publicUrl
    },

    // ── Notifications ──────────────────────────────────────────────
    async getNotifications(limit = 30) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data
    },

    async getUnreadCount() {
        const supabase = createClient()
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)

        if (error) throw error
        return count || 0
    },

    async createNotification(userId: string, type: string, title: string, message: string, workspaceId?: string, data: any = {}) {
        const supabase = createClient()
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                workspace_id: workspaceId || null,
                data
            })

        if (error) console.error('Failed to create notification:', error)
    },

    async markAsRead(notificationId: string) {
        const supabase = createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)

        if (error) throw error
    },

    async markAllAsRead() {
        const supabase = createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        if (error) throw error
    },

    // ── RBAC ───────────────────────────────────────────────────────
    async updateMemberRole(memberId: string, newRole: string) {
        const supabase = createClient()
        const { error } = await supabase.rpc('update_member_role', {
            target_member_id: memberId,
            new_role: newRole
        })
        if (error) throw error
    },

    async removeMember(memberId: string) {
        const supabase = createClient()
        const { error } = await supabase.rpc('remove_workspace_member', {
            target_member_id: memberId
        })
        if (error) throw error
    },

    async getCurrentUserRole(workspaceId: string) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', user.id)
            .single()

        if (error) return null
        return data?.role as string
    },

    // ── Sprints ────────────────────────────────────────────────────
    async getSprints(boardId: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('board_id', boardId)
            .order('start_date', { ascending: true })

        if (error) throw error
        return data
    },

    async createSprint(boardId: string, name: string, startDate: string, endDate: string, goal?: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('sprints')
            .insert({
                board_id: boardId,
                name,
                start_date: startDate,
                end_date: endDate,
                goal: goal || null
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateSprint(sprintId: string, updates: { name?: string, goal?: string, status?: string, start_date?: string, end_date?: string }) {
        const supabase = createClient()
        const { error } = await supabase
            .from('sprints')
            .update(updates)
            .eq('id', sprintId)

        if (error) throw error
    },

    async assignTaskToSprint(taskId: string, sprintId: string | null) {
        const supabase = createClient()
        const { error } = await supabase
            .from('tasks')
            .update({ sprint_id: sprintId })
            .eq('id', taskId)

        if (error) throw error
    }
}
