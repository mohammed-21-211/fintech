-- ============================================================
-- Fintech App — Auto-provision an organization for every new user
-- Replaces the handle_new_user() from migration 001 so that, on signup,
-- the user gets: a profile + a personal organization + an 'owner' membership.
-- All in one transaction, SECURITY DEFINER so it bypasses RLS.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id   uuid;
  display_name text;
begin
  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(new.email, '@', 1)
  );

  -- 1. Profile (unchanged behaviour from migration 001).
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  -- 2. Personal organization owned by the new user.
  insert into public.organizations (name, owner_id)
  values (display_name || '''s Organization', new.id)
  returning id into new_org_id;

  -- 3. Owner membership linking the user to that organization.
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
