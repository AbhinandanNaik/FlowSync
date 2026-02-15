import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBoardStore } from '@/lib/store/board-store'
import { useRouter } from 'next/navigation'

export function useRealtime(boardId: string) {
    const supabase = createClient()
    const router = useRouter()
    // const { addColumn, addTask } = useBoardStore() // Not used currently

    useEffect(() => {
        const channel = supabase
            .channel('realtime-board')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                },
                (payload) => {
                    console.log('Realtime task change:', payload)
                    // In a real app complexity increases here (handling updates vs inserts vs deletes)
                    // For now, we will just refresh the router to refetch data
                    // OR implement precise state updates
                    router.refresh()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'columns',
                    filter: `board_id=eq.${boardId}`,
                },
                (payload) => {
                    console.log('Realtime column change:', payload)
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router, boardId])
}
