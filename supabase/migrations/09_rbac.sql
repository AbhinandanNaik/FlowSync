-- RBAC: extend workspace_members roles and add permissions
-- Supported roles: owner, admin, editor, viewer

-- Update role column to support new values (already text, so just adding reference)
-- Note: owner is automatically set via the handle_new_workspace trigger

-- Permissions utility function
create or replace function check_workspace_permission(
  target_workspace_id uuid,
  required_permission text
) returns boolean as $$
declare
  user_role text;
begin
  select role into user_role
  from workspace_members
  where workspace_id = target_workspace_id
  and user_id = auth.uid();

  if user_role is null then
    return false;
  end if;

  -- Permission matrix
  case required_permission
    when 'manage_roles' then
      return user_role in ('owner', 'admin');
    when 'invite_members' then
      return user_role in ('owner', 'admin');
    when 'remove_members' then
      return user_role in ('owner', 'admin');
    when 'delete_board' then
      return user_role in ('owner', 'admin');
    when 'create_board' then
      return user_role in ('owner', 'admin', 'editor');
    when 'edit_task' then
      return user_role in ('owner', 'admin', 'editor');
    when 'create_task' then
      return user_role in ('owner', 'admin', 'editor');
    when 'delete_task' then
      return user_role in ('owner', 'admin', 'editor');
    when 'view' then
      return true; -- all roles can view
    else
      return false;
  end case;
end;
$$ language plpgsql security definer;

-- Function to update a member's role (only admins/owners)
create or replace function update_member_role(
  target_member_id uuid,
  new_role text
) returns void as $$
declare
  target_wid uuid;
begin
  -- Get the workspace from the member
  select workspace_id into target_wid
  from workspace_members
  where id = target_member_id;

  -- Check that the caller is admin or owner
  if not exists (
    select 1 from workspace_members
    where workspace_id = target_wid
    and user_id = auth.uid()
    and role in ('owner', 'admin')
  ) then
    raise exception 'Access denied: Only owners and admins can change roles.';
  end if;

  -- Prevent demoting the owner
  if exists (
    select 1 from workspace_members
    where id = target_member_id
    and role = 'owner'
  ) then
    raise exception 'Cannot change the owner role.';
  end if;

  -- Update the role
  update workspace_members set role = new_role where id = target_member_id;
end;
$$ language plpgsql security definer;

-- Function to remove a member (only admins/owners)
create or replace function remove_workspace_member(
  target_member_id uuid
) returns void as $$
declare
  target_wid uuid;
begin
  select workspace_id into target_wid
  from workspace_members
  where id = target_member_id;

  if not exists (
    select 1 from workspace_members
    where workspace_id = target_wid
    and user_id = auth.uid()
    and role in ('owner', 'admin')
  ) then
    raise exception 'Access denied: Only owners and admins can remove members.';
  end if;

  -- Prevent removing the owner
  if exists (
    select 1 from workspace_members
    where id = target_member_id
    and role = 'owner'
  ) then
    raise exception 'Cannot remove the workspace owner.';
  end if;

  delete from workspace_members where id = target_member_id;
end;
$$ language plpgsql security definer;
