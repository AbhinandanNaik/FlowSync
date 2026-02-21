-- Add Due Dates, Priorities & Assignees to Tasks
alter table tasks add column if not exists due_date timestamp with time zone;
alter table tasks add column if not exists priority text not null default 'medium';
alter table tasks add column if not exists assignee_id uuid references auth.users(id) on delete set null;

-- Index for fast filtering
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_tasks_priority on tasks(priority);
create index if not exists idx_tasks_assignee_id on tasks(assignee_id);
