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
            .select('*')
            .in('column_id', columnIds)
            .order('order', { ascending: true })

        if (error) throw error
        return data.map(task => ({ ...task, columnId: task.column_id })) as Task[]
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

    async createTask(columnId: string, content: string, order: number) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tasks')
            .insert({ column_id: columnId, content, order })
            .select()
            .single()

        if (error) throw error
        return { ...data, columnId: data.column_id } as Task
    },

    async updateTask(taskId: UniqueId, content: string, description?: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tasks')
            .update({ content, description })
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
    }
}
