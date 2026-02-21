import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Layout } from 'lucide-react'

export default async function BoardsPage() {
    const supabase = await createClient()

    const { data: boards, error } = await supabase
        .from('boards')
        .select('*, columns(count)')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to load boards:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Boards</h1>
            </div>

            {(!boards || boards.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Layout className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No boards yet</p>
                    <p className="text-sm mt-1 mb-6">Create a board from the dashboard to get started</p>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {boards.map((board: any) => (
                        <Link
                            key={board.id}
                            href={`/dashboard/boards/${board.id}`}
                            className="group block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {board.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {board.columns?.[0]?.count || 0} columns
                                    </p>
                                </div>
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
