-- Sprints for board-level planning
create table if not exists sprints (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  name text not null,
  goal text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text not null default 'planning', -- 'planning', 'active', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add sprint_id to tasks (optional FK)
alter table tasks add column if not exists sprint_id uuid references sprints(id) on delete set null;

create index if not exists idx_sprints_board_id on sprints(board_id);
create index if not exists idx_tasks_sprint_id on tasks(sprint_id);

-- RLS
alter table sprints enable row level security;

create policy "Users can view sprints of accessible boards" on sprints
  for select using (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = sprints.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can create sprints" on sprints
  for insert with check (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = sprints.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can update sprints" on sprints
  for update using (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = sprints.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can delete sprints" on sprints
  for delete using (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = sprints.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );
