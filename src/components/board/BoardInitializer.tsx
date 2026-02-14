'use client'

import { useEffect } from 'react'
import { useBoardStore } from '@/lib/store/board-store'
import { useRealtime } from '@/hooks/useRealtime'
import { Board, Column, Task } from '@/types/board'

interface BoardInitializerProps {
    board: Board;
    columns: Column[];
    tasks: Task[];
}

export function BoardInitializer({ board, columns, tasks }: BoardInitializerProps) {
    const { setBoards, setColumns, setTasks } = useBoardStore()

    // Subscribe to Realtime events
    useRealtime(board.id.toString())

    useEffect(() => {
        setBoards([board])
        setColumns(columns)
        setTasks(tasks)
    }, [board, columns, tasks, setBoards, setColumns, setTasks])

    return null
}
