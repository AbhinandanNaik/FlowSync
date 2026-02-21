-- Labels for board-level task categorization
create table if not exists labels (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  name text not null,
  color text not null default '#6366f1', -- indigo default
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Junction table for many-to-many task <-> label
create table if not exists task_labels (
  task_id uuid references tasks(id) on delete cascade not null,
  label_id uuid references labels(id) on delete cascade not null,
  primary key (task_id, label_id)
);

-- Indexes
create index if not exists idx_labels_board_id on labels(board_id);
create index if not exists idx_task_labels_task_id on task_labels(task_id);
create index if not exists idx_task_labels_label_id on task_labels(label_id);

-- RLS
alter table labels enable row level security;
alter table task_labels enable row level security;

-- Labels: viewable/editable by board members
create policy "Users can view labels of accessible boards" on labels
  for select using (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = labels.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can create labels" on labels
  for insert with check (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = labels.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can delete labels" on labels
  for delete using (
    exists (
      select 1 from boards
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where boards.id = labels.board_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

-- Task Labels: viewable/editable by board members
create policy "Users can view task labels" on task_labels
  for select using (
    exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_labels.task_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can add task labels" on task_labels
  for insert with check (
    exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_labels.task_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can remove task labels" on task_labels
  for delete using (
    exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_labels.task_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );
