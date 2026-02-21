'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, CheckCheck, MessageSquare, UserPlus, AlertCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS: Record<string, React.ReactNode> = {
    assignment: <UserPlus className="w-4 h-4 text-indigo-500" />,
    comment: <MessageSquare className="w-4 h-4 text-blue-500" />,
    mention: <AlertCircle className="w-4 h-4 text-amber-500" />,
    invitation: <UserPlus className="w-4 h-4 text-emerald-500" />,
    due_soon: <Clock className="w-4 h-4 text-red-500" />,
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchData = useCallback(async () => {
        try {
            const [notifs, count] = await Promise.all([
                api.getNotifications(20),
                api.getUnreadCount()
            ])
            setNotifications(notifs)
            setUnreadCount(count)
        } catch {
            // Table may not exist yet
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Real-time subscription for new notifications
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel('user-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                () => {
                    fetchData()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchData])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await api.markAsRead(notificationId)
            fetchData()
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await api.markAllAsRead()
            fetchData()
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                                        }`}
                                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                >
                                    {/* Icon */}
                                    <div className="mt-0.5 flex-shrink-0">
                                        {TYPE_ICONS[notif.type] || <Bell className="w-4 h-4 text-gray-400" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notif.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
