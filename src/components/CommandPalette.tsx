'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkey } from '@/hooks/useHotkey'
import { useTheme } from 'next-themes'
import {
    Command, Search, Layout, BarChart3, Sun, Moon,
    Plus, Home, Settings, LogOut, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
    id: string
    label: string
    description?: string
    icon: React.ReactNode
    shortcut?: string
    action: () => void
    category: string
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { setTheme, theme } = useTheme()

    // Register Ctrl+Shift+P or Cmd+Shift+P
    useHotkey('ctrl+shift+p', () => setIsOpen(true))

    // All available commands
    const commands = useMemo<CommandItem[]>(() => [
        {
            id: 'go-dashboard',
            label: 'Go to Dashboard',
            icon: <Home className="w-4 h-4" />,
            action: () => { router.push('/dashboard'); setIsOpen(false) },
            category: 'Navigation',
        },
        {
            id: 'go-analytics',
            label: 'Go to Analytics',
            icon: <BarChart3 className="w-4 h-4" />,
            action: () => { router.push('/dashboard/analytics'); setIsOpen(false) },
            category: 'Navigation',
        },
        {
            id: 'toggle-theme',
            label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
            icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
            action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsOpen(false) },
            category: 'Preferences',
        },
        {
            id: 'open-search',
            label: 'Open Search',
            icon: <Search className="w-4 h-4" />,
            shortcut: '⌘K',
            action: () => {
                setIsOpen(false)
                setTimeout(() => {
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
                }, 100)
            },
            category: 'Actions',
        },
        {
            id: 'new-board',
            label: 'Create New Board',
            icon: <Plus className="w-4 h-4" />,
            action: () => { setIsOpen(false) },
            category: 'Actions',
        },
    ], [theme, router, setTheme])

    // Filter commands
    const filteredCommands = useMemo(() => {
        if (!query.trim()) return commands
        const q = query.toLowerCase()
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(q) ||
            cmd.category.toLowerCase().includes(q)
        )
    }, [commands, query])

    // Group by category
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {}
        filteredCommands.forEach(cmd => {
            if (!groups[cmd.category]) groups[cmd.category] = []
            groups[cmd.category].push(cmd)
        })
        return groups
    }, [filteredCommands])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setQuery('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    if (!isOpen) return null

    let globalIndex = 0

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Palette */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <Command className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command..."
                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none"
                    />
                    <kbd className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Command List */}
                <div className="max-h-72 overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            No matching commands
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category}>
                                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    {category}
                                </div>
                                {items.map((cmd) => {
                                    const thisIndex = globalIndex++
                                    return (
                                        <button
                                            key={cmd.id}
                                            onClick={cmd.action}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                                thisIndex === selectedIndex && 'bg-indigo-50 dark:bg-indigo-900/20'
                                            )}
                                        >
                                            <div className="flex-shrink-0 text-gray-500">
                                                {cmd.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {cmd.label}
                                                </p>
                                                {cmd.description && (
                                                    <p className="text-xs text-gray-400">{cmd.description}</p>
                                                )}
                                            </div>
                                            {cmd.shortcut && (
                                                <kbd className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                    {cmd.shortcut}
                                                </kbd>
                                            )}
                                            <ArrowRight className="w-3 h-3 text-gray-300" />
                                        </button>
                                    )
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
