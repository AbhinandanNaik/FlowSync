'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment } from '@/types/board'
import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, Reply, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
    taskId: string
}

function buildCommentTree(comments: Comment[]): Comment[] {
    const map = new Map<string, Comment>()
    const roots: Comment[] = []

    comments.forEach(c => map.set(c.id, { ...c, replies: [] }))

    map.forEach(comment => {
        if (comment.parent_id && map.has(comment.parent_id)) {
            map.get(comment.parent_id)!.replies!.push(comment)
        } else {
            roots.push(comment)
        }
    })

    return roots
}

function getInitials(name?: string, email?: string): string {
    if (name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return (email || '?')[0].toUpperCase()
}

function getAvatarColor(userId: string): string {
    const colors = [
        'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
        'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500'
    ]
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

// ── Single Comment Bubble ──────────────────────────────────────────
function CommentItem({
    comment,
    onReply,
    onDelete,
    depth = 0
}: {
    comment: Comment
    onReply: (parentId: string) => void
    onDelete: (commentId: string) => void
    depth?: number
}) {
    const [showReplies, setShowReplies] = useState(true)
    const hasReplies = comment.replies && comment.replies.length > 0

    return (
        <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}>
            <div className="flex gap-3 py-3 group">
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(comment.user_id)}`}>
                    {getInitials(comment.userFullName, comment.userEmail)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {comment.userFullName || comment.userEmail || 'User'}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onReply(comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-500 transition-colors"
                        >
                            <Reply className="w-3 h-3" />
                            Reply
                        </button>
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Replies Toggle & Nested Replies */}
            {hasReplies && (
                <div>
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 ml-11 mb-1"
                    >
                        {showReplies ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                    </button>

                    {showReplies && comment.replies!.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Main CommentSection ────────────────────────────────────────────
export function CommentSection({ taskId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const fetchComments = useCallback(async () => {
        try {
            const data = await api.getTaskComments(taskId)
            setComments(data)
        } catch (err) {
            console.error('Failed to load comments:', err)
        } finally {
            setLoading(false)
        }
    }, [taskId])

    // Initial fetch
    useEffect(() => {
        fetchComments()
    }, [fetchComments])

    // Real-time subscription
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel(`task-comments-${taskId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'task_comments',
                    filter: `task_id=eq.${taskId}`
                },
                () => {
                    // Re-fetch on any change to get full profile joins
                    fetchComments()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [taskId, fetchComments])

    const handleSubmit = async () => {
        if (!newComment.trim() || submitting) return
        setSubmitting(true)
        try {
            await api.createComment(taskId, newComment.trim(), replyingTo)
            setNewComment('')
            setReplyingTo(null)
            // The realtime subscription will handle the refresh,
            // but we also fetch eagerly for responsiveness
            await fetchComments()
        } catch (err) {
            console.error('Failed to post comment:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return
        try {
            await api.deleteComment(commentId)
            await fetchComments()
        } catch (err) {
            console.error('Failed to delete comment:', err)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const tree = buildCommentTree(comments)

    const replyTarget = replyingTo
        ? comments.find(c => c.id === replyingTo)
        : null

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Comments {comments.length > 0 && `(${comments.length})`}
                </span>
            </div>

            {/* Comment List */}
            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : tree.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                    No comments yet. Start the discussion!
                </p>
            ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 mb-3 pr-1 custom-scrollbar">
                    {tree.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={(parentId) => setReplyingTo(parentId)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Reply indicator */}
            {replyingTo && (
                <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-xs text-indigo-600 dark:text-indigo-400">
                    <Reply className="w-3 h-3" />
                    Replying to {replyTarget?.userFullName || replyTarget?.userEmail || 'comment'}
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Input area */}
            <div className="flex gap-2 items-end">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
                    rows={1}
                    className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors flex-shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
