export type UniqueId = string | number;

export interface Board {
  id: UniqueId;
  title: string;
  workspace_id?: UniqueId | null; // Added workspace support
}

export interface Column {
  id: UniqueId;
  boardId: UniqueId;
  title: string;
  order: number;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: UniqueId;
  columnId: UniqueId;
  content: string;
  description?: string;
  order: number;
  due_date?: string | null;
  priority?: Priority;
  assignee_id?: string | null;
  // Joined from profiles (for assignee display)
  assigneeEmail?: string;
  assigneeFullName?: string;
  assigneeAvatarUrl?: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  userEmail?: string;
  userFullName?: string;
  userAvatarUrl?: string;
  // Nested replies (built client-side)
  replies?: Comment[];
}

export interface BoardState {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
}
