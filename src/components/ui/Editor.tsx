'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
    value?: string
    onChange: (value: string) => void
    editable?: boolean
}

export function Editor({ value, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Add more details...',
            }),
        ],
        content: value,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-3 py-2',
            },
        },
    })

    if (!editor) {
        return null
    }

    if (!editable) {
        return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: value || '' }} />
    }

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-900">
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={Bold}
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={Italic}
                />
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={Heading2}
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={List}
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={ListOrdered}
                />
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}

function ToolButton({ onClick, isActive, icon: Icon }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "p-1.5 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                isActive && "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            )}
        >
            <Icon className="w-4 h-4" />
        </button>
    )
}
