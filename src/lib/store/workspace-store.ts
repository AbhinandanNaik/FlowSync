import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Workspace {
    id: string;
    name: string;
    owner_id: string;
}

interface WorkspaceStore {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;

    setWorkspaces: (workspaces: Workspace[]) => void;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
    persist(
        (set) => ({
            workspaces: [],
            currentWorkspace: null,

            setWorkspaces: (workspaces) => set({ workspaces }),
            setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
        }),
        {
            name: 'flowsync-workspace-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
