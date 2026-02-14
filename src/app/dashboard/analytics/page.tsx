import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/analytics/KPICard'
import { TaskDistributionChart } from '@/components/analytics/TaskDistributionChart' // Will create next
import { CheckSquare, Layout, Activity, Clock } from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()

    // Aggregate Data (server-side for now, could be its own API endpoint)
    // 1. Get all tasks
    const { data: tasks } = await supabase.from('tasks').select('*')
    // 2. Get all columns
    const { data: columns } = await supabase.from('columns').select('*')
    // 3. Get all boards
    const { data: boards } = await supabase.from('boards').select('*')

    const totalTasks = tasks?.length || 0
    const totalBoards = boards?.length || 0

    // Group tasks by column
    const tasksPerColumn = columns?.map(col => ({
        name: col.title,
        count: tasks?.filter(t => t.column_id === col.id).length || 0
    })) || []

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Analytics</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Tasks"
                    value={totalTasks}
                    icon={CheckSquare}
                    description="Across all boards"
                />
                <KPICard
                    title="Active Boards"
                    value={totalBoards}
                    icon={Layout}
                />
                <KPICard
                    title="Avg. Completion Time"
                    value="2.4d"
                    icon={Clock}
                    description="Estimated"
                />
                <KPICard
                    title="Velocity"
                    value="12"
                    icon={Activity}
                    description="Tasks per week"
                />
            </div>

            <TaskDistributionChart data={tasksPerColumn} />
        </div>
    )
}
