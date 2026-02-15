'use client'

import { useEffect, useState } from 'react'
import { ChevronsUpDown, Check, Plus, Briefcase, Settings } from 'lucide-react'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { api } from '@/lib/api'
import { CreateWorkspaceModal } from './CreateWorkspaceModal'
import { WorkspaceSettingsModal } from './WorkspaceSettingsModal'
import { cn } from '@/lib/utils'

export function WorkspaceSwitcher() {
    const { workspaces, currentWorkspace, setWorkspaces, setCurrentWorkspace } = useWorkspaceStore()
    const [isOpen, setIsOpen] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    // Load workspaces on mount
    useEffect(() => {
        async function load() {
            try {
                const data = await api.getWorkspaces()
                if (data) {
                    setWorkspaces(data)
                    // If no workspace selected, select first one or allow 'Personal' as null?
                    // For now, let's auto-select first one if none selected
                    if (!currentWorkspace && data.length > 0) {
                        setCurrentWorkspace(data[0])
                    }
                }
            } catch (e) {
                console.error("Failed to load workspaces", e)
            }
        }
        load()
    }, [])

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
                            {currentWorkspace ? currentWorkspace.name[0].toUpperCase() : 'P'}
                        </div>
                        <span className="font-medium text-sm truncate max-w-[120px]">
                            {currentWorkspace ? currentWorkspace.name : 'Personal'}
                        </span>
                    </div>
                    <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                </button>

                {isOpen && (
                    <div className="absolute top-14 left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                            Workspaces
                        </div>

                        {/* Personal Option (Placeholder for null state if we support it) */}
                        <button
                            onClick={() => {
                                setCurrentWorkspace(null)
                                setIsOpen(false)
                            }}
                            className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Personal
                            </div>
                            {!currentWorkspace && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>

                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => {
                                    setCurrentWorkspace(ws)
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                            >
                                <span className="truncate">{ws.name}</span>
                                {currentWorkspace?.id === ws.id && <Check className="w-4 h-4 text-indigo-600" />}
                            </button>
                        ))}

                        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowSettingsModal(true)
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300"
                        >
                            <Settings className="w-4 h-4" />
                            Manage Members
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowCreateModal(true)
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300"
                        >
                            <Plus className="w-4 h-4" />
                            Create Workspace
                        </button>
                    </div>
                )}
            </div>

            <CreateWorkspaceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            <WorkspaceSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </>
    )
}
