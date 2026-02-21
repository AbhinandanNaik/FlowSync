'use client'

import { useState, useEffect } from 'react'
import { Priority } from '@/types/board'
import { Label } from '@/types/label'
import { api } from '@/lib/api'
import { Filter, X, Flag, Calendar, Tag, User } from 'lucide-react'
import { useBoardStore } from '@/lib/store/board-store'

interface FilterBarProps {
    boardId: string
    members: any[]
}

export interface BoardFilters {
    priority: Priority | null
    labelId: string | null
    assigneeId: string | null
    overdue: boolean
}

export const EMPTY_FILTERS: BoardFilters = {
    priority: null,
    labelId: null,
    assigneeId: null,
    overdue: false,
}

export function FilterBar({ boardId, members }: FilterBarProps) {
    const [labels, setLabels] = useState<Label[]>([])
    const { filters, setFilters, clearFilters } = useBoardStore()

    useEffect(() => {
        async function loadLabels() {
            try {
                const data = await api.getLabels(boardId)
                setLabels(data)
            } catch {
                // Labels table may not exist yet
            }
        }
        loadLabels()
    }, [boardId])

    const isActive = filters.priority || filters.labelId || filters.assigneeId || filters.overdue

    return (
        <div className="flex items-center gap-2 flex-wrap py-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Filter className="w-4 h-4" />
                Filter
            </div>

            {/* Priority Filter */}
            <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: (e.target.value || null) as Priority | null })}
                className="text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
                <option value="">All Priorities</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
            </select>

            {/* Label Filter */}
            {labels.length > 0 && (
                <select
                    value={filters.labelId || ''}
                    onChange={(e) => setFilters({ ...filters, labelId: e.target.value || null })}
                    className="text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    <option value="">All Labels</option>
                    {labels.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            )}

            {/* Assignee Filter */}
            {members.length > 0 && (
                <select
                    value={filters.assigneeId || ''}
                    onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value || null })}
                    className="text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    <option value="">All Members</option>
                    {members.map((m: any) => (
                        <option key={m.user_id} value={m.user_id}>
                            {m.fullName || m.email}
                        </option>
                    ))}
                </select>
            )}

            {/* Overdue Toggle */}
            <button
                onClick={() => setFilters({ ...filters, overdue: !filters.overdue })}
                className={`text-xs rounded-md border px-2 py-1 transition-colors ${filters.overdue
                    ? 'border-red-400 bg-red-50 text-red-600 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
            >
                <Calendar className="w-3 h-3 inline mr-1" />
                Overdue
            </button>

            {/* Clear Filters */}
            {isActive && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                    <X className="w-3 h-3" />
                    Clear
                </button>
            )}
        </div>
    )
}
