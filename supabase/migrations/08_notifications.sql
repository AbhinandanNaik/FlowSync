-- Notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workspace_id uuid references workspaces(id) on delete cascade,
  type text not null, -- 'assignment', 'comment', 'mention', 'invitation', 'due_soon'
  title text not null,
  message text not null,
  data jsonb default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_is_read on notifications(user_id, is_read);

-- RLS: users can only see their own notifications
alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

create policy "Authenticated users can create notifications" on notifications
  for insert with check (true);

create policy "Users can delete own notifications" on notifications
  for delete using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table notifications;
