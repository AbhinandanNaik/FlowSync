export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

const PERMISSION_MATRIX: Record<string, Role[]> = {
    manage_roles: ['owner', 'admin'],
    invite_members: ['owner', 'admin'],
    remove_members: ['owner', 'admin'],
    delete_board: ['owner', 'admin'],
    create_board: ['owner', 'admin', 'editor'],
    edit_task: ['owner', 'admin', 'editor'],
    create_task: ['owner', 'admin', 'editor'],
    delete_task: ['owner', 'admin', 'editor'],
    view: ['owner', 'admin', 'editor', 'viewer'],
};

export function hasPermission(role: Role | string | undefined, permission: string): boolean {
    if (!role) return false;
    const allowedRoles = PERMISSION_MATRIX[permission];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role as Role);
}

// Convenience helpers
export const canEditTask = (role?: string) => hasPermission(role, 'edit_task');
export const canCreateTask = (role?: string) => hasPermission(role, 'create_task');
export const canDeleteTask = (role?: string) => hasPermission(role, 'delete_task');
export const canCreateBoard = (role?: string) => hasPermission(role, 'create_board');
export const canDeleteBoard = (role?: string) => hasPermission(role, 'delete_board');
export const canInviteMembers = (role?: string) => hasPermission(role, 'invite_members');
export const canManageRoles = (role?: string) => hasPermission(role, 'manage_roles');
export const canRemoveMembers = (role?: string) => hasPermission(role, 'remove_members');
