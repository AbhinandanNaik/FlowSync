'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal()
        } else {
            dialogRef.current?.close()
        }
    }, [isOpen])

    const handleClose = () => {
        onClose()
    }

    // Prevent closing when clicking inside the dialog
    // Close when clicking backdrop
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const dialogDimensions = dialogRef.current?.getBoundingClientRect()
        if (
            dialogDimensions &&
            (e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom)
        ) {
            handleClose()
        }
    }

    if (!isOpen) return null

    return (
        <dialog
            ref={dialogRef}
            className="backdrop:bg-black/50 backdrop:backdrop-blur-sm rounded-xl shadow-2xl p-0 w-full max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            onClick={handleDialogClick}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                    onClick={handleClose}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4">{children}</div>
        </dialog>
    )
}
