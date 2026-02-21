import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/analytics/KPICard'
import { TaskDistributionChart } from '@/components/analytics/TaskDistributionChart'
import { PriorityBreakdownChart } from '@/components/analytics/PriorityBreakdownChart'
import { ExportButton } from '@/components/analytics/ExportButton'

export default async function AnalyticsPage() {
    const supabase = await createClient()

    // Fetch data
    const { data: tasks } = await supabase.from('tasks').select('*')
    const { data: columns } = await supabase.from('columns').select('*')
    const { data: boards } = await supabase.from('boards').select('*')

    const totalTasks = tasks?.length || 0
    const totalBoards = boards?.length || 0

    // Tasks per column
    const tasksPerColumn = columns?.map(col => ({
        name: col.title,
        count: tasks?.filter(t => t.column_id === col.id).length || 0
    })) || []

    // Priority breakdown
    const priorityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    tasks?.forEach(t => {
        const p = t.priority || 'medium'
        if (p in priorityCounts) priorityCounts[p]++
    })
    const priorityData = Object.entries(priorityCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count
    }))

    // Overdue tasks
    const now = new Date()
    const overdueTasks = tasks?.filter(t => t.due_date && new Date(t.due_date) < now).length || 0

    // Assigned tasks
    const assignedTasks = tasks?.filter(t => t.assignee_id).length || 0

    // Export data (flattened tasks)
    const exportData = tasks?.map(t => ({
        id: t.id,
        title: t.content,
        description: t.description || '',
        priority: t.priority || 'medium',
        due_date: t.due_date || '',
        assigned: t.assignee_id ? 'Yes' : 'No',
        column: columns?.find(c => c.id === t.column_id)?.title || '',
    })) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Analytics</h1>
                <ExportButton data={exportData} filename={`flowsync-report-${new Date().toISOString().slice(0, 10)}`} />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <KPICard
                    title="Total Tasks"
                    value={totalTasks}
                    iconName="CheckSquare"
                    description="Across all boards"
                />
                <KPICard
                    title="Active Boards"
                    value={totalBoards}
                    iconName="Layout"
                />
                <KPICard
                    title="Overdue Tasks"
                    value={overdueTasks}
                    iconName="AlertTriangle"
                    description={overdueTasks > 0 ? "Needs attention" : "All on track"}
                />
                <KPICard
                    title="Assigned"
                    value={assignedTasks}
                    iconName="Users"
                    description={`${totalTasks > 0 ? Math.round((assignedTasks / totalTasks) * 100) : 0}% assigned`}
                />
                <KPICard
                    title="Avg. Completion"
                    value="2.4d"
                    iconName="Clock"
                    description="Estimated"
                />
                <KPICard
                    title="Velocity"
                    value="12"
                    iconName="Activity"
                    description="Tasks per week"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TaskDistributionChart data={tasksPerColumn} />
                <PriorityBreakdownChart data={priorityData} />
            </div>
        </div>
    )
}
