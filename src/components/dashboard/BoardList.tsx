'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { api } from '@/lib/api'
import { Board } from '@/types/board'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'

export function BoardList() {
    const { currentWorkspace } = useWorkspaceStore()
    const [boards, setBoards] = useState<Board[]>([])
    const [loading, setLoading] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newBoardTitle, setNewBoardTitle] = useState('')

    useEffect(() => {
        async function loadBoards() {
            if (!currentWorkspace) {
                setBoards([]) // Or fetch personal boards?
                return
            }

            setLoading(true)
            try {
                const data = await api.getWorkspaceBoards(currentWorkspace.id)
                setBoards(data)
            } catch (error) {
                console.error("Failed to load boards:", error)
            } finally {
                setLoading(false)
            }
        }

        loadBoards()
    }, [currentWorkspace])

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBoardTitle.trim() || !currentWorkspace) return

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('boards')
                .insert({
                    title: newBoardTitle,
                    owner_id: user.id,
                    workspace_id: currentWorkspace.id
                })
                .select()
                .single()

            if (error) throw error

            setBoards([...boards, data as Board])
            setNewBoardTitle('')
            setIsCreateOpen(false)
        } catch (error) {
            console.error("Failed to create board:", error)
            alert("Error creating board")
        }
    }

    if (!currentWorkspace) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Workspace Selected</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please select or create a workspace from the sidebar.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {currentWorkspace.name} Boards
                </h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Board
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    // Skeletons
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))
                ) : boards.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No boards in this workspace.</p>
                    </div>
                ) : (
                    boards.map(board => (
                        <Link
                            key={board.id}
                            href={`/dashboard/boards/${board.id}`}
                            className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-colors group"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">
                                {board.title}
                            </h3>
                            <p className="mt-2 text-xs text-gray-400">
                                ID: {board.id}
                            </p>
                        </Link>
                    ))
                )}
            </div>

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create New Board"
            >
                <form onSubmit={handleCreateBoard} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Board Title</label>
                        <input
                            type="text"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g., Q4 Roadmap"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
                        >
                            Create Board
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
