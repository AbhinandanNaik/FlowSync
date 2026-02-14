'use client'

import * as React from 'react'
import { UserNav } from './UserNav'
import { useTheme } from 'next-themes'
import { Sun, Moon, Database } from 'lucide-react'

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
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <UserNav />
            </div>
        </header>
    )
}
