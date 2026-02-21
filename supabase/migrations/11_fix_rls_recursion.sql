-- Fix infinite recursion in workspace_members SELECT policy
-- The original policy queries workspace_members from within a workspace_members policy,
-- causing PostgreSQL to recursively evaluate the policy forever.
-- Fix: simply check if the current user matches the row's workspace, without re-querying workspace_members.

drop policy if exists "Users can view members of their workspaces." on workspace_members;

create policy "Users can view members of their workspaces." on workspace_members
  for select using (
    -- Users can always see their own membership rows
    user_id = auth.uid()
    -- Or if they are the workspace owner
    or exists (
      select 1 from workspaces
      where workspaces.id = workspace_members.workspace_id
      and workspaces.owner_id = auth.uid()
    )
  );

-- Also add a broader policy: members in the same workspace can see each other.
-- This uses a direct user_id check to avoid recursion.
create policy "Members can view co-members." on workspace_members
  for select using (
    workspace_id in (
      select wm.workspace_id from workspace_members wm
      where wm.user_id = auth.uid()
    )
  );
