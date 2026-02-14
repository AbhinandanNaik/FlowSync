'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useBoardStore } from '@/lib/store/board-store'

interface NewColumnDialogProps {
    boardId: string
}

export function NewColumnDialog({ boardId }: NewColumnDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState('')
    const { addColumn } = useBoardStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        await addColumn(boardId, title)
        setTitle('')
        setIsOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Column
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add New Column"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Column Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g., To Do, Done"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
                        >
                            Create Column
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
