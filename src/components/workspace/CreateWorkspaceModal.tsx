'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/lib/store/workspace-store'

interface CreateWorkspaceModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const { setWorkspaces, setCurrentWorkspace, workspaces } = useWorkspaceStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            const newWorkspace = await api.createWorkspace(name)
            setWorkspaces([newWorkspace, ...workspaces])
            setCurrentWorkspace(newWorkspace)
            setName('')
            onClose()
        } catch (error) {
            console.error("Failed to create workspace:", error)
            alert("Failed to create workspace")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Workspace"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Workspace Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g., Engineering, Marketing"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Workspace'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
