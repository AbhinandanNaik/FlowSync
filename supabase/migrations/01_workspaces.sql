-- 1. Create Workspaces Table
create table if not exists workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Workspace Members Table
-- Created BEFORE policies that reference it
create table if not exists workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, user_id)
);

-- 3. Enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;

-- 4. Policies for Workspaces
create policy "Users can view workspaces they are members of." on workspaces
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

create policy "Users can create workspaces." on workspaces
  for insert with check (auth.uid() = owner_id);

-- 5. Policies for Members
create policy "Users can view members of their workspaces." on workspace_members
  for select using (
    exists (
      select 1 from workspace_members as wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
    )
    or
    exists (
        select 1 from workspaces
        where workspaces.id = workspace_members.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

-- 6. Update Boards Table
-- Add workspace_id (nullable for legacy support)
alter table boards add column if not exists workspace_id uuid references workspaces on delete cascade;

-- RLS Update for Boards
drop policy if exists "Users can view their own boards." on boards;
create policy "Users can view boards in their workspaces." on boards
  for select using (
    owner_id = auth.uid()
    or
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = boards.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );
  
create policy "Users can create boards in workspaces." on boards
  for insert with check (
    owner_id = auth.uid()
    -- Add check for workspace membership if workspace_id is present
  );
  
-- 7. Trigger Logic (for auto-adding owner)
create or replace function public.handle_new_workspace()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'admin');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_workspace_created on workspaces;
create trigger on_workspace_created
  after insert on workspaces
  for each row execute procedure public.handle_new_workspace();
