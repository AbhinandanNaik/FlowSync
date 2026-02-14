import { createClient } from '@/lib/supabase/server'
import { BoardView } from '@/components/board/BoardView'
import { BoardInitializer } from '@/components/board/BoardInitializer'
import { NewColumnDialog } from '@/components/board/NewColumnDialog'
import { notFound } from 'next/navigation'

export default async function BoardPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Board
    const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', id)
        .single()

    if (boardError || !board) {
        // For development with fake creds, we might want to skip notFound() so we can see the UI
        // But strictly speaking:
        console.error("Error fetching board:", boardError)
        // notFound() 
    }

    // 2. Fetch Columns
    const { data: columns } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', id)
        .order('order', { ascending: true })

    // 3. Fetch Tasks
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('column_id', columns?.map(c => c.id) || [])
        .order('order', { ascending: true })

    return (
        <div className="h-full flex flex-col">
            <BoardInitializer
                board={board || { id: 'mock', title: 'Mock Board (DB Error)' }}
                columns={columns || []}
                tasks={tasks || []}
            />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {board?.title || 'Board Title'}
                </h1>
                <div className="flex gap-2">
                    <NewColumnDialog boardId={board?.id ? String(board.id) : ''} />
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500">
                        Share
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <BoardView />
            </div>
        </div>
    )
}
