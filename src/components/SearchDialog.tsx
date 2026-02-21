'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import { useHotkey } from '@/hooks/useHotkey'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { Search, FileText, Users, Layout, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
    type: 'task' | 'board' | 'member'
    id: string
    title: string
    subtitle?: string
}

export function SearchDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { currentWorkspace } = useWorkspaceStore()

    const debouncedQuery = useDebounce(query, 250)

    // Register global shortcut
    useHotkey('ctrl+k', () => setIsOpen(true))

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setQuery('')
            setResults([])
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Search on debounced query
    useEffect(() => {
        async function search() {
            if (!debouncedQuery.trim() || !currentWorkspace) {
                setResults([])
                return
            }
            setLoading(true)
            try {
                const searchResults: SearchResult[] = []

                // Search tasks
                const supabase = (await import('@/lib/supabase/client')).createClient()
                const { data: tasks } = await supabase
                    .from('tasks')
                    .select('id, content, column_id')
                    .ilike('content', `%${debouncedQuery}%`)
                    .limit(5)

                tasks?.forEach(t => {
                    searchResults.push({
                        type: 'task',
                        id: String(t.id),
                        title: t.content,
                        subtitle: 'Task'
                    })
                })

                // Search boards
                const { data: boards } = await supabase
                    .from('boards')
                    .select('id, title')
                    .eq('workspace_id', currentWorkspace.id)
                    .ilike('title', `%${debouncedQuery}%`)
                    .limit(5)

                boards?.forEach(b => {
                    searchResults.push({
                        type: 'board',
                        id: String(b.id),
                        title: b.title,
                        subtitle: 'Board'
                    })
                })

                // Search members
                const members = await api.getWorkspaceMembers(currentWorkspace.id)
                const matchedMembers = members.filter((m: any) =>
                    m.fullName?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                    m.email?.toLowerCase().includes(debouncedQuery.toLowerCase())
                ).slice(0, 5)

                matchedMembers.forEach((m: any) => {
                    searchResults.push({
                        type: 'member',
                        id: m.user_id,
                        title: m.fullName || m.email,
                        subtitle: m.email
                    })
                })

                setResults(searchResults)
                setSelectedIndex(0)
            } catch {
                // Search may fail silently
            } finally {
                setLoading(false)
            }
        }
        search()
    }, [debouncedQuery, currentWorkspace])

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false)
        if (result.type === 'board') {
            router.push(`/dashboard/boards/${result.id}`)
        }
        // Tasks and members could navigate to their respective contexts
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex])
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const typeIcons: Record<string, React.ReactNode> = {
        task: <FileText className="w-4 h-4 text-indigo-500" />,
        board: <Layout className="w-4 h-4 text-emerald-500" />,
        member: <Users className="w-4 h-4 text-amber-500" />,
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search tasks, boards, members..."
                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none"
                    />
                    <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : results.length === 0 && query.trim() ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            No results found
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Start typing to search...
                        </div>
                    ) : (
                        results.map((result, idx) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSelect(result)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${idx === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                    }`}
                            >
                                <div className="flex-shrink-0">
                                    {typeIcons[result.type]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {result.title}
                                    </p>
                                    {result.subtitle && (
                                        <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
