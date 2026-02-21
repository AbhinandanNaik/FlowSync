'use client'

import { useState, useEffect } from 'react'
import { Task, Priority } from '@/types/board'
import { Modal } from '@/components/ui/Modal'
import { Editor } from '@/components/ui/Editor'
import { useBoardStore } from '@/lib/store/board-store'
import { CommentSection } from './CommentSection'
import { AttachmentSection } from './AttachmentSection'
import { api } from '@/lib/api'
import { Trash2, Calendar, Flag, User } from 'lucide-react'
import { format } from 'date-fns'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
    critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
}

interface TaskDetailModalProps {
    task: Task | null
    onClose: () => void
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [priority, setPriority] = useState<Priority>('medium')
    const [assigneeId, setAssigneeId] = useState<string>('')
    const [members, setMembers] = useState<any[]>([])
    const { updateTaskContent, deleteTask, columns, boards } = useBoardStore()

    useEffect(() => {
        if (task) {
            setTitle(task.content)
            setDescription(task.description || '')
            setDueDate(task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : '')
            setPriority(task.priority || 'medium')
            setAssigneeId(task.assignee_id || '')
        }
    }, [task])

    // Fetch workspace members for assignee dropdown
    useEffect(() => {
        async function fetchMembers() {
            if (!task) return
            try {
                const column = columns.find(c => c.id === task.columnId)
                if (!column) return
                const board = boards.find(b => b.id === column.boardId)
                if (!board?.workspace_id) return
                const data = await api.getWorkspaceMembers(String(board.workspace_id))
                setMembers(data)
            } catch {
                // Workspace members may not be available
            }
        }
        fetchMembers()
    }, [task, columns, boards])

    const handleSave = async () => {
        if (!task || !title.trim()) return

        // Update content & description via store (optimistic)
        await updateTaskContent(task.id, title, description)

        // Update extra fields directly via API
        try {
            await api.updateTask(task.id, {
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                priority,
                assignee_id: assigneeId || null,
            })
        } catch (err) {
            console.error('Failed to update task extras:', err)
        }

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

    const isOverdue = dueDate && new Date(dueDate) < new Date()

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

                {/* Metadata Row: Priority, Due Date, Assignee */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Priority */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            <Flag className="w-3.5 h-3.5" />
                            Priority
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className={`w-full text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 bg-white dark:bg-gray-800 ${PRIORITY_CONFIG[priority].color} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                        >
                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Due Date
                        </label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={`w-full text-sm rounded-md border px-2.5 py-1.5 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${isOverdue ? 'border-red-400 text-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'}`}
                        />
                    </div>

                    {/* Assignee */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            <User className="w-3.5 h-3.5" />
                            Assignee
                        </label>
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Unassigned</option>
                            {members.map((m: any) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.fullName || m.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description Editor */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Description
                    </label>
                    <Editor value={description} onChange={setDescription} />
                </div>

                {/* Attachments Section */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <AttachmentSection taskId={String(task.id)} />
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <CommentSection taskId={String(task.id)} />
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
