'use client'

import * as React from 'react'
import { UserNav } from './UserNav'
import { NotificationBell } from './NotificationBell'
import { SearchDialog } from './SearchDialog'
import { CommandPalette } from './CommandPalette'
import { useTheme } from 'next-themes'
import { Sun, Moon, Database, Search } from 'lucide-react'

export function TopNav() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">FlowSync</h2>
                </div>
            </header>
        )
    }

    return (
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                    <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">FlowSync</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Search trigger */}
                <button
                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search...</span>
                    <kbd className="hidden sm:flex text-[10px] font-mono bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">⌘K</kbd>
                </button>

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <NotificationBell />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <UserNav />
            </div>

            {/* Global Search Dialog (mounted here for Ctrl+K) */}
            <SearchDialog />
            <CommandPalette />
        </header>
    )
}
