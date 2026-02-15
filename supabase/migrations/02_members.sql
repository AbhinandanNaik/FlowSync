-- Function to add a member to a workspace by email
-- Only executable by workspace admins
create or replace function add_member_by_email(
  target_email text,
  target_workspace_id uuid
) returns void as $$
declare
  target_user_id uuid;
begin
  -- 1. Check if the executing user is an ADMIN of the workspace
  if not exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = target_workspace_id
    and workspace_members.user_id = auth.uid()
    and workspace_members.role = 'admin'
  ) then
    raise exception 'Access denied: Only admins can invite members.';
  end if;

  -- 2. Look up the user ID from the profiles table
  select id into target_user_id from profiles where email = target_email;

  if target_user_id is null then
    raise exception 'User not found. key: %', target_email;
  end if;

  -- 3. Add the user to the workspace
  insert into workspace_members (workspace_id, user_id, role)
  values (target_workspace_id, target_user_id, 'member')
  on conflict (workspace_id, user_id) do nothing;

end;
$$ language plpgsql security definer;
