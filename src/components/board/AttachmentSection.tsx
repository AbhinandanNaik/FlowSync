'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { Paperclip, Upload, Trash2, Download, Image, FileText, File as FileIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AttachmentSectionProps {
    taskId: string
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-emerald-500" />
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    return <FileIcon className="w-4 h-4 text-gray-500" />
}

export function AttachmentSection({ taskId }: AttachmentSectionProps) {
    const [attachments, setAttachments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchAttachments = useCallback(async () => {
        try {
            const data = await api.getAttachments(taskId)
            setAttachments(data)
        } catch {
            // Table may not exist yet
        } finally {
            setLoading(false)
        }
    }, [taskId])

    useEffect(() => {
        fetchAttachments()
    }, [fetchAttachments])

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        setUploading(true)
        try {
            for (let i = 0; i < files.length; i++) {
                await api.uploadAttachment(taskId, files[i])
            }
            await fetchAttachments()
        } catch (err) {
            console.error('Failed to upload:', err)
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (attachmentId: string, filePath: string) => {
        if (!confirm('Delete this attachment?')) return
        try {
            await api.deleteAttachment(attachmentId, filePath)
            await fetchAttachments()
        } catch (err) {
            console.error('Failed to delete attachment:', err)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        handleUpload(e.dataTransfer.files)
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Attachments {attachments.length > 0 && `(${attachments.length})`}
                </span>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mb-3 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragOver
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                />
                {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Upload className="w-4 h-4" />
                        Drop files here or click to upload
                    </div>
                )}
            </div>

            {/* Attachment List */}
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : attachments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No attachments yet</p>
            ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {attachments.map((att) => {
                        const isImage = att.mime_type?.startsWith('image/')
                        const url = api.getAttachmentUrl(att.file_path)

                        return (
                            <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 group">
                                {/* Preview or icon */}
                                {isImage ? (
                                    <img
                                        src={url}
                                        alt={att.file_name}
                                        className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        {getFileIcon(att.mime_type)}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {att.file_name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatFileSize(att.file_size)} · {formatDistanceToNow(new Date(att.created_at), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Download className="w-3.5 h-3.5 text-gray-500" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(att.id, att.file_path)}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
