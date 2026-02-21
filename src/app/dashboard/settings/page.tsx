import { Settings } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Settings className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Settings</p>
                    <p className="text-sm mt-1">Workspace and account settings coming soon.</p>
                </div>
            </div>
        </div>
    )
}
