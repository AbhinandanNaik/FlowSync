'use client'

import { Download } from 'lucide-react'

interface ExportButtonProps {
    data: any[]
    filename: string
}

export function ExportButton({ data, filename }: ExportButtonProps) {
    const handleExport = () => {
        if (data.length === 0) return

        // Convert to CSV
        const headers = Object.keys(data[0])
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    const val = row[h]
                    // Escape commas and quotes
                    const str = String(val ?? '')
                    return str.includes(',') || str.includes('"')
                        ? `"${str.replace(/"/g, '""')}"`
                        : str
                }).join(',')
            )
        ]

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
            <Download className="w-4 h-4" />
            Export CSV
        </button>
    )
}
