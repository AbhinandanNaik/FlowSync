'use client'

import { useMemo } from 'react'
import { useBoardStore } from '@/lib/store/board-store'
import { differenceInDays, format, isWithinInterval, parseISO, addDays, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { Flag } from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-indigo-500',
    low: 'bg-emerald-500',
}

export function TimelineView() {
    const { tasks, columns } = useBoardStore()

    // Only show tasks with due dates
    const timedTasks = useMemo(() =>
        tasks.filter(t => t.due_date).sort((a, b) =>
            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
        ), [tasks])

    if (timedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Flag className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No tasks with due dates</p>
                <p className="text-sm mt-1">Add due dates to your tasks to see them on the timeline</p>
            </div>
        )
    }

    // Calculate date range for the timeline
    const dates = timedTasks.map(t => new Date(t.due_date!))
    const minDate = startOfDay(new Date(Math.min(...dates.map(d => d.getTime()))))
    const maxDate = addDays(startOfDay(new Date(Math.max(...dates.map(d => d.getTime())))), 1)
    const totalDays = Math.max(differenceInDays(maxDate, minDate) + 1, 7)

    // Generate day headers
    const dayHeaders = Array.from({ length: totalDays }, (_, i) => addDays(minDate, i))

    return (
        <div className="overflow-x-auto pb-4">
            {/* Header: Date columns */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <div className="w-48 flex-shrink-0 px-3 py-2 text-xs font-semibold text-gray-500 border-r border-gray-200 dark:border-gray-700">
                    Task
                </div>
                {dayHeaders.map((date, idx) => {
                    const isToday = startOfDay(new Date()).getTime() === startOfDay(date).getTime()
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "w-16 flex-shrink-0 px-1 py-2 text-center text-[10px] font-medium border-r border-gray-100 dark:border-gray-800",
                                isToday ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-gray-400'
                            )}
                        >
                            <div>{format(date, 'EEE')}</div>
                            <div className={cn("text-xs", isToday && 'font-bold')}>{format(date, 'd')}</div>
                        </div>
                    )
                })}
            </div>

            {/* Task Rows */}
            {timedTasks.map(task => {
                const dueDate = new Date(task.due_date!)
                const dayOffset = differenceInDays(startOfDay(dueDate), minDate)
                const column = columns.find(c => c.id === task.columnId)
                const color = PRIORITY_COLORS[task.priority || 'medium']

                return (
                    <div key={String(task.id)} className="flex items-center border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {/* Task name */}
                        <div className="w-48 flex-shrink-0 px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.content}</p>
                            <p className="text-[10px] text-gray-400 truncate">{column?.title}</p>
                        </div>

                        {/* Timeline bar */}
                        <div className="flex flex-1 relative" style={{ height: '40px' }}>
                            {dayHeaders.map((_, idx) => (
                                <div key={idx} className="w-16 flex-shrink-0 border-r border-gray-50 dark:border-gray-800" />
                            ))}
                            {/* Task marker */}
                            <div
                                className={cn("absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center px-2 text-[10px] text-white font-medium shadow-sm", color)}
                                style={{
                                    left: `${dayOffset * 64 + 8}px`,
                                    minWidth: '48px',
                                }}
                                title={`Due: ${format(dueDate, 'MMM d, yyyy')}`}
                            >
                                {format(dueDate, 'MMM d')}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
