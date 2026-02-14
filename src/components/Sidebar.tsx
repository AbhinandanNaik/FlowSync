import Link from 'next/link'
import { LayoutDashboard, KanbanSquare, Settings, BarChart } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/boards', label: 'Boards', icon: KanbanSquare },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
    return (
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hidden md:block min-h-screen">
            <div className="p-6">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    )
}
