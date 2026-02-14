'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useBoardStore } from '@/lib/store/board-store'

interface NewTaskDialogProps {
    columnId: string
}

export function NewTaskDialog({ columnId }: NewTaskDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState('')
    const { addTask } = useBoardStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        await addTask(columnId, content)
        setContent('')
        setIsOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex gap-2 items-center w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Task
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add New Task"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Description</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                            placeholder="What needs to be done?"
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
                            Add Task
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
