'use client'

import { LayoutGrid, GanttChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBoardStore } from '@/lib/store/board-store'

export function ViewSwitcher() {
    const { viewMode, setViewMode } = useBoardStore()

    return (
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-100 dark:bg-gray-800">
            <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    viewMode === 'kanban'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
            >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
            </button>
            <button
                onClick={() => setViewMode('timeline')}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    viewMode === 'timeline'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
            >
                <GanttChart className="w-3.5 h-3.5" />
                Timeline
            </button>
        </div>
    )
}
