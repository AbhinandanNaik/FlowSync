# FlowSync

**FlowSync** is a modern, enterprise-ready project management platform designed for speed and clarity. It combines the flexibility of Kanban boards with the power of real-time collaboration and workspace-based multi-tenancy.

Built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

![FlowSync Screenshot](https://placehold.co/1200x600/1e293b/ffffff?text=FlowSync+Dashboard) 
*(Replace with actual screenshot)*

## 🚀 Key Features

*   🔐 **Secure Authentication**: Robust email/password login and signup flow powered by Supabase Auth with PKCE and Middleware protection.
*   🏢 **Multi-Tenant Workspaces**: Create, manage, and switch between multiple isolated workspaces (e.g., Personal, Work, Clients).
*   📋 **Interactive Kanban Boards**: 
    *   Drag-and-drop tasks and columns using `@dnd-kit`.
    *   Optimistic updates for instant UI feedback.
    *   Rich text descriptions, attachments, and subtasks.
*   ⚡ **Real-Time Collaboration**: Changes (task moves, edits, comments) are synced instantly across all connected clients via Supabase Realtime.
*   👥 **Team Management**: Invite team members to your workspace securely via email.
*   📊 **Analytics Dashboard**: Visual insights into task distribution and completion rates using Recharts.
*   📜 **Activity Logs**: Full audit trail of all workspace actions (who created, moved, or deleted what).
*   🎨 **Modern UI**: Fully responsive, dark mode supported, and animated with Framer Motion and Lucide Icons.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Drag & Drop**: [dnd-kit](https://dndkit.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Rich Text**: [Tiptap](https://tiptap.dev/)

## 📦 Getting Started

### Prerequisites
*   Node.js 18+
*   A [Supabase](https://supabase.com/) project

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/flow-sync.git
    cd flow-sync
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Database Setup**:
    Run the SQL migrations located in `supabase/migrations` via the Supabase Dashboard SQL Editor in this order:
    1.  `01_workspaces.sql`: Sets up workspaces and boards tables.
    2.  `02_members.sql`: Adds member management functions.
    3.  `03_activity_logs.sql`: Sets up the audit logging system.

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The core schema consists of:
*   `workspaces`: Top-level containers for projects.
*   `workspace_members`: Users belonging to a workspace with roles.
*   `boards`: Kanban boards belonging to a workspace.
*   `columns`: Lists within a board (e.g., "To Do", "Done").
*   `tasks`: Individual items within columns.
*   `activity_logs`: Audit trail for workspace actions.
*   `profiles`: Public user information synced from Auth.

## 🤝 Contributing

Contributions are always welcome!
1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
