-- Task Attachments (metadata for files stored in Supabase Storage)
create table if not exists task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  file_name text not null,
  file_path text not null, -- Storage path in the bucket
  file_size bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_task_attachments_task_id on task_attachments(task_id);

-- RLS
alter table task_attachments enable row level security;

create policy "Users can view attachments on accessible tasks" on task_attachments
  for select using (
    exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_attachments.task_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can upload attachments" on task_attachments
  for insert with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from tasks
      join columns on columns.id = tasks.column_id
      join boards on boards.id = columns.board_id
      left join workspace_members on workspace_members.workspace_id = boards.workspace_id
      where tasks.id = task_attachments.task_id
      and (boards.owner_id = auth.uid() or workspace_members.user_id = auth.uid())
    )
  );

create policy "Users can delete their own attachments" on task_attachments
  for delete using (auth.uid() = uploaded_by);
