// Step A: The Architectural Intent
// We are cleaning this file to provide a blank canvas for FlowSync.
// This serves as the root route ("/") of our application.

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold tracking-tight">FlowSync</h1>
      <p className="text-lg text-gray-500 mt-4">
        Real-Time Collaborative Kanban Board
      </p>
      <div className="mt-8 p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
        <p className="text-sm font-mono">
          System Status: <span className="text-green-500">Online</span>
        </p>
        <p className="text-xs text-gray-400 mt-2">
           Next.js 15 + Tailwind v4 + Supabase Ready
        </p>
      </div>
    </div>
  );
}

// Step B: Code Breakdown
// - `export default function Home()`: The main page component for the root route.
// - `flex min-h-screen ...`: Tailwind utility classes for centering content.
// - `font-bold tracking-tight`: Typography distinctiveness.

// Step C: What's Next
// Connect this to the App Sidebar or Auth feature once implemented.
