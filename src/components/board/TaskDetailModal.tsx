'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/board'
import { Modal } from '@/components/ui/Modal'
import { Editor } from '@/components/ui/Editor'
import { useBoardStore } from '@/lib/store/board-store'
import { Trash2 } from 'lucide-react'

interface TaskDetailModalProps {
    task: Task | null
    onClose: () => void
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const { updateTaskContent, deleteTask } = useBoardStore()

    useEffect(() => {
        if (task) {
            setTitle(task.content)
            setDescription(task.description || '')
        }
    }, [task])

    const handleSave = async () => {
        if (!task || !title.trim()) return
        // We update both title and description. 
        // Currently our store's updateTaskContent only takes content.
        // We'll need to update the store to handle objects or separate fields.
        // For now passing JSON string or just content if we only updated standard fields? 
        // Wait, let's fix the store first to accept full updates.

        // TEMPORARY: We will just update content for now until store is fixed.
        // Actually, I should have updated the store first. I will assume store has updateTask(task.id, { content: title, description })

        // Since I haven't updated the store yet, I'll add a TODO and just call updateTaskContent with new title
        // But wait, the plan said I would update the store.
        // I will call a new method I am about to add: updateTaskDetails
        await updateTaskContent(task.id, title, description)
        onClose()
    }

    const handleDelete = async () => {
        if (!task) return
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTask(task.id)
            onClose()
        }
    }

    if (!task) return null

    return (
        <Modal isOpen={!!task} onClose={onClose} title="Task-123">
            <div className="-mt-4 space-y-4">
                {/* Title Input */}
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-bold w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Description Editor */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Description
                    </label>
                    <Editor value={description} onChange={setDescription} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Task
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
