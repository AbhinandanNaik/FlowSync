import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BoardList } from '@/components/dashboard/BoardList'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

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

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <BoardList />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    )
}
