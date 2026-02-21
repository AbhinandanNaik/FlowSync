'use client'

import {
    CheckSquare, Layout, Activity, Clock, AlertTriangle, Users,
    LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
    CheckSquare,
    Layout,
    Activity,
    Clock,
    AlertTriangle,
    Users,
}

interface KPICardProps {
    title: string
    value: string | number
    iconName: string
    description?: string
    trend?: string
}

export function KPICard({ title, value, iconName, description, trend }: KPICardProps) {
    const Icon = iconMap[iconName] || CheckSquare

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
            </div>
            <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
                {description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}
