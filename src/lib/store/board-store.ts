import { create } from 'zustand';
import { Board, Column, Task, UniqueId } from '@/types/board';
import { api } from '@/lib/api';

interface BoardStore {
    boards: Board[];
    columns: Column[];
    tasks: Task[];

    // Actions
    setBoards: (boards: Board[]) => void;
    setColumns: (columns: Column[]) => void;
    setTasks: (tasks: Task[]) => void;

    addColumn: (boardId: string, title: string) => Promise<void>;
    addTask: (columnId: string, content: string) => Promise<void>;
    updateTaskContent: (taskId: UniqueId, content: string, description?: string) => Promise<void>;
    deleteTask: (taskId: UniqueId) => Promise<void>;

    moveTask: (taskId: UniqueId, newColumnId: UniqueId, newOrder: number) => void;
    moveColumn: (columnId: UniqueId, newOrder: number) => void;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
    boards: [],
    columns: [],
    tasks: [],

    setBoards: (boards) => set({ boards }),
    setColumns: (columns) => set({ columns }),
    setTasks: (tasks) => set({ tasks }),

    addColumn: async (boardId, title) => {
        const order = get().columns.length;
        // Optimistic Update (skipping for simplicity in CRUD)
        try {
            const newCol = await api.createColumn(boardId, title, order);
            set((state) => ({ columns: [...state.columns, newCol] }));
        } catch (error) {
            console.error("Failed to create column:", error);
        }
    },

    addTask: async (columnId, content) => {
        const order = get().tasks.filter(t => t.columnId === columnId).length;
        try {
            const newTask = await api.createTask(columnId, content, order);
            set((state) => ({ tasks: [...state.tasks, newTask] }));

            // Log Activity
            const column = get().columns.find(c => c.id === columnId);
            if (column) {
                const board = get().boards.find(b => b.id === column.boardId);
                if (board?.workspace_id) {
                    api.logActivity(String(board.workspace_id), 'create_task', 'task', String(newTask.id), {
                        taskContent: content,
                        boardId: board.id,
                        boardTitle: board.title
                    });
                }
            }

        } catch (error) {
            console.error("Failed to create task:", error);
        }
    },

    updateTaskContent: async (taskId, content, description) => {
        // Optimistic Update
        set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, content, description } : t)
        }));
        try {
            await api.updateTask(taskId, content, description);
        } catch (error) {
            console.error("Failed to update task:", error);
            // Revert logic would go here
        }
    },

    deleteTask: async (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        set((state) => ({
            tasks: state.tasks.filter(t => t.id !== taskId)
        }));
        try {
            await api.deleteTask(taskId);

            // Log Activity
            if (task) {
                const column = get().columns.find(c => c.id === task.columnId);
                if (column) {
                    const board = get().boards.find(b => b.id === column.boardId);
                    if (board?.workspace_id) {
                        api.logActivity(String(board.workspace_id), 'delete_task', 'task', String(taskId), {
                            taskContent: task.content,
                            boardId: board.id
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    },

    moveTask: async (taskId, newColumnId, newOrder) => {
        const previousTask = get().tasks.find(t => t.id === taskId);
        set((state) => {
            const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) return state;

            const updatedTasks = [...state.tasks];
            updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                columnId: newColumnId,
                order: newOrder
            };
            return { tasks: updatedTasks };
        });

        try {
            await api.updateTaskPosition(taskId, newColumnId, newOrder);

            // Log if column changed
            if (previousTask && previousTask.columnId !== newColumnId) {
                const column = get().columns.find(c => c.id === newColumnId);
                const oldColumn = get().columns.find(c => c.id === previousTask.columnId); // find old column
                if (column && oldColumn) {
                    const board = get().boards.find(b => b.id === column.boardId);
                    if (board?.workspace_id) {
                        api.logActivity(String(board.workspace_id), 'move_task', 'task', String(taskId), {
                            taskContent: previousTask.content,
                            fromColumn: oldColumn.title,
                            toColumn: column.title,
                            boardId: board.id
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to persist task move:', error);
        }
    },

    moveColumn: async (columnId, newOrder) => {
        try {
            await api.updateColumnOrder(columnId, newOrder);
        } catch (error) {
            console.error('Failed to persist column move:', error);
        }
    }
}));
