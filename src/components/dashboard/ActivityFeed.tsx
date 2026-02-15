'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { Activity, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLog {
    id: string
    action_type: string
    entity_type: string
    details: any
    created_at: string
    userFullName: string
    userEmail: string
    userAvatarUrl?: string
}

export function ActivityFeed() {
    const { currentWorkspace } = useWorkspaceStore()
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!currentWorkspace) return

        loadActivity()

        // Polling for simplicity, or we could use Realtime subscription
        const interval = setInterval(loadActivity, 10000)
        return () => clearInterval(interval)
    }, [currentWorkspace])

    async function loadActivity() {
        if (!currentWorkspace) return
        try {
            const data = await api.getWorkspaceActivity(currentWorkspace.id)
            setActivities(data)
        } catch (error) {
            console.error("Failed to load activity:", error)
        }
    }

    if (!currentWorkspace) return null

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Activity Log</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center text-sm text-gray-500 py-10">
                        No recent activity.
                    </div>
                ) : (
                    activities.map(log => (
                        <ActivityItem key={log.id} log={log} />
                    ))
                )}
            </div>
        </div>
    )
}

function ActivityItem({ log }: { log: ActivityLog }) {
    // Helper to format message based on action
    const getMessage = () => {
        const { details } = log
        switch (log.action_type) {
            case 'create_task':
                return (
                    <span>
                        created task <span className="font-medium text-gray-900 dark:text-white">"{details.taskContent}"</span>
                    </span>
                )
            case 'move_task':
                return (
                    <span>
                        moved task <span className="font-medium text-gray-900 dark:text-white">"{details.taskContent}"</span> to <span className="font-medium text-indigo-600 dark:text-indigo-400">{details.toColumn}</span>
                    </span>
                )
            case 'delete_task':
                return (
                    <span>
                        deleted task <span className="font-medium text-gray-900 dark:text-white">"{details.taskContent}"</span>
                    </span>
                )
            case 'create_board':
                return <span>created a new board</span>
            default:
                return <span>performed an action</span>
        }
    }

    return (
        <div className="flex gap-3 items-start text-sm">
            <div className="mt-0.5 min-w-[32px] w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 overflow-hidden">
                {log.userAvatarUrl ? (
                    <img src={log.userAvatarUrl} alt={log.userFullName} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-4 h-4" />
                )}
            </div>
            <div>
                <p className="text-gray-600 dark:text-gray-300 leading-snug">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1">
                        {log.userFullName || log.userEmail?.split('@')[0] || 'User'}
                    </span>
                    {getMessage()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
            </div>
        </div>
    )
}
