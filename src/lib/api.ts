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
    }
}
