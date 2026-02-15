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

export interface Task {
  id: UniqueId;
  columnId: UniqueId;
  content: string;
  description?: string;
  order: number;
}

export interface BoardState {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
}
