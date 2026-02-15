-- Activity Logs Table
create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) not null,
  user_id uuid references auth.users(id) not null,
  action_type text not null, -- e.g., 'create_task', 'move_task', 'delete_task'
  entity_type text not null, -- e.g., 'task', 'board', 'member'
  entity_id uuid not null,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table activity_logs enable row level security;

create policy "Workspace members can view activity logs"
  on activity_logs for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = activity_logs.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can insert activity logs for their workspace"
  on activity_logs for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = activity_logs.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );
