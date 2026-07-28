-- ============================================================
-- Fintech App — Generic, app-agnostic project provisioning
--
-- Makes the multi-tenant backend reusable for unlimited applications
-- (Expense Manager, Clinic, CMS, Solar, Skin Care, ...). The signup trigger
-- no longer knows about any specific application: it only provisions the
-- tenant primitives (profile + organization + owner membership). Each
-- application provisions its OWN project on top of that org by calling the
-- generic public.ensure_project(...) primitive — no SQL or trigger changes
-- are ever needed to onboard a new app.
-- ============================================================

-- ──────────────────────────────────────────────
-- Generic, idempotent project provisioning primitive.
-- Ensures the organization has a project with the given key, creating it only
-- if it doesn't already exist, and always returns the (new or existing) row.
--
-- SECURITY DEFINER so it can insert regardless of who calls it, but it is NOT
-- a blanket bypass: callers must be a member of the target organization
-- (enforced below via is_org_member, which reads auth.uid()). Idempotency is
-- guaranteed by the unique (organization_id, key) constraint from migration 007.
-- ──────────────────────────────────────────────
create or replace function public.ensure_project(
  org_id       uuid,
  project_key  text,
  project_name text
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.projects;
begin
  -- Tenant guard: only members of the org may provision its projects.
  -- (SECURITY DEFINER bypasses RLS, so we re-assert the boundary here.)
  if not public.is_org_member(org_id) then
    raise exception 'not a member of organization %', org_id
      using errcode = '42501'; -- insufficient_privilege
  end if;

  insert into public.projects (organization_id, key, name, status)
  values (org_id, project_key, project_name, 'active')
  on conflict (organization_id, key) do nothing
  returning * into result;

  -- on conflict do nothing => no row returned; fetch the existing project.
  if result.id is null then
    select * into result
    from public.projects
    where organization_id = org_id and key = project_key;
  end if;

  return result;
end;
$$;

-- ──────────────────────────────────────────────
-- Reset the signup trigger to the tenant primitives only.
-- Profile + organization + owner membership — and nothing application-specific.
-- handle_new_user() must never know about 'expense', 'clinic', 'cms', etc.
-- ──────────────────────────────────────────────
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

  -- 1. Profile.
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  -- 2. Personal organization owned by the new user.
  -- Ownership is tracked via `created_by` (the live schema's column).
  insert into public.organizations (name, created_by)
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

-- ──────────────────────────────────────────────
-- Drop the app-specific provisioning helper. Project creation is now handled
-- generically by each application via public.ensure_project(...).
-- ──────────────────────────────────────────────
drop function if exists public.ensure_expense_project(uuid);
