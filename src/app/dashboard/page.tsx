import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Dashboard
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/boards/1" className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-colors">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Product Launch</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        4 active tasks
                    </p>
                </Link>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Tasks</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        You have no active tasks.
                    </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white">
                    <h3 className="font-semibold">Pro Tip</h3>
                    <p className="mt-2 text-sm opacity-90">
                        Drag and drop tasks between columns to update their status instantly.
                    </p>
                </div>
            </div>
        </div>
    )
}
