-- Task Comments with Threading Support
create table if not exists task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  parent_id uuid references task_comments(id) on delete cascade, -- null = top-level, set = reply
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookups
create index idx_task_comments_task_id on task_comments(task_id);
create index idx_task_comments_parent_id on task_comments(parent_id);

-- RLS
alter table task_comments enable row level security;

-- Users can view comments on tasks they have access to (via board ownership or workspace membership)
create policy "Users can view task comments" on task_comments
  for select using (
    exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_comments.task_id
      and (
        boards.owner_id = auth.uid()
        or workspace_members.user_id = auth.uid()
      )
    )
  );

-- Users can insert comments on accessible tasks
create policy "Users can create task comments" on task_comments
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_comments.task_id
      and (
        boards.owner_id = auth.uid()
        or workspace_members.user_id = auth.uid()
      )
    )
  );

-- Users can delete their own comments
create policy "Users can delete own comments" on task_comments
  for delete using (auth.uid() = user_id);

-- Users can update their own comments
create policy "Users can update own comments" on task_comments
  for update using (auth.uid() = user_id);

-- Enable realtime for this table
alter publication supabase_realtime add table task_comments;
