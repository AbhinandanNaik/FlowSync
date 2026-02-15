'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { UserPlus, User, Loader2 } from 'lucide-react'

interface WorkspaceSettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

interface Member {
    id: string
    user_id: string
    email: string
    fullName: string
    avatarUrl?: string
    role: string
}

export function WorkspaceSettingsModal({ isOpen, onClose }: WorkspaceSettingsModalProps) {
    const { currentWorkspace } = useWorkspaceStore()
    const [activeTab, setActiveTab] = useState<'members' | 'danger'>('members')
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(false)

    // Invite State
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)

    useEffect(() => {
        if (isOpen && currentWorkspace) {
            loadMembers()
        }
    }, [isOpen, currentWorkspace])

    async function loadMembers() {
        if (!currentWorkspace) return
        setLoading(true)
        try {
            const data = await api.getWorkspaceMembers(currentWorkspace.id)
            setMembers(data)
        } catch (error) {
            console.error("Failed to load members:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault()
        if (!inviteEmail.trim() || !currentWorkspace) return

        setInviting(true)
        try {
            await api.inviteMember(currentWorkspace.id, inviteEmail)
            alert("Member invited successfully!")
            setInviteEmail('')
            loadMembers() // Refresh list
        } catch (error: any) {
            console.error("Invite failed:", error)
            alert(error.message || "Failed to invite member. Make sure they have a FlowSync account.")
        } finally {
            setInviting(false)
        }
    }

    if (!currentWorkspace) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Settings: ${currentWorkspace.name}`}
        >
            <div className="flex flex-col h-[400px]">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Members
                    </button>
                    {/* Future: Danger Zone for Deleting Workspace */}
                </div>

                {/* Members Tab Content */}
                {activeTab === 'members' && (
                    <div className="flex-1 overflow-y-auto space-y-6">

                        {/* Invite Form */}
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Invite by email (must be registered)"
                                className="flex-1 px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={inviting || !inviteEmail}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
                            >
                                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Invite
                            </button>
                        </form>

                        {/* Member List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                Workspace Members ({members.length})
                            </h3>

                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Loading members...</div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {members.map(member => (
                                        <div key={member.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                                                    {member.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt={member.fullName} className="w-8 h-8 rounded-full" />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {member.fullName || member.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize">
                                                {member.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
