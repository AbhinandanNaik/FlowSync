-- Step A: The Architectural Intent
-- We are defining the relational schema for our Kanban board.
-- 1. `profiles`: Extends the default Supabase `auth.users` table with app-specific data (name, avatar).
-- 2. `boards`: The top-level container for tasks.
-- 3. `columns`: Vertical lists within a board (To Do, In Progress, Done).
-- 4. `tasks`: The actual work items.
--
-- We enable Row Level Security (RLS) on ALL tables to ensure users can only see their own data.

-- 1. PROFILES
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 2. BOARDS
create table boards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users not null
);

alter table boards enable row level security;

create policy "Users can view their own boards." on boards
  for select using (auth.uid() = owner_id);

create policy "Users can create boards." on boards
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own boards." on boards
  for update using (auth.uid() = owner_id);

create policy "Users can delete their own boards." on boards
  for delete using (auth.uid() = owner_id);

-- 3. COLUMNS
create table columns (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards on delete cascade not null,
  title text not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table columns enable row level security;

create policy "Users can view columns of their boards." on columns
  for select using (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Users can create columns for their boards." on columns
  for insert with check (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Users can update columns of their boards." on columns
  for update using (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Users can delete columns of their boards." on columns
  for delete using (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and boards.owner_id = auth.uid()
    )
  );

-- 4. TASKS
create table tasks (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references columns on delete cascade not null,
  content text not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tasks enable row level security;

-- Helper policy logic: User owns the board -> owns the column -> owns the task
create policy "Users can view tasks." on tasks
  for select using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = tasks.column_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Users can create tasks." on tasks
  for insert with check (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = tasks.column_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Users can update tasks." on tasks
  for update using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = tasks.column_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Users can delete tasks." on tasks
  for delete using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = tasks.column_id
      and boards.owner_id = auth.uid()
    )
  );

-- Step C: Triggers
-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
