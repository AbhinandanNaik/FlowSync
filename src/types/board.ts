export type UniqueId = string | number;

export interface Board {
  id: UniqueId;
  title: string;
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
  description?: string; // New field for rich text
  order: number;
}

export interface BoardState {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
}
