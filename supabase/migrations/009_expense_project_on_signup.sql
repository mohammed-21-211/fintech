-- ============================================================
-- Fintech App — Auto-provision an "expense" project on signup
-- When a user registers from the Expense Manager application, ensure their
-- organization has an `expense` project. Idempotent and safe to re-run.
--
-- Signup origin is read from auth metadata: the client tags sign-ups with
-- raw_user_meta_data->>'app' = 'expense' (see auth.service.ts). Only that app
-- gets an expense project, so other apps on this backend stay unaffected.
-- ============================================================

-- ──────────────────────────────────────────────
-- Idempotent helper: ensure an org has its expense project.
-- SECURITY DEFINER so it can run from the signup trigger (no session) and from
-- the client (via the projects RLS policy the member already satisfies).
-- Relies on the unique (organization_id, key) constraint for idempotency.
-- ──────────────────────────────────────────────
create or replace function public.ensure_expense_project(org_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  project_id uuid;
begin
  insert into public.projects (organization_id, key, name, status)
  values (org_id, 'expense', 'Expense Manager', 'active')
  on conflict (organization_id, key) do nothing
  returning id into project_id;

  -- on conflict do nothing => no row returned; fetch the existing project.
  if project_id is null then
    select id into project_id
    from public.projects
    where organization_id = org_id and key = 'expense';
  end if;

  return project_id;
end;
$$;

-- ──────────────────────────────────────────────
-- Extend the signup trigger: profile + org + owner membership (migration 005)
-- and now the expense project when the signup came from the Expense Manager.
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
  signup_app   text;
begin
  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(new.email, '@', 1)
  );
  signup_app := new.raw_user_meta_data->>'app';

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

  -- 4. Expense project — only when the user registered from the Expense Manager.
  if signup_app = 'expense' then
    perform public.ensure_expense_project(new_org_id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────
-- Backfill: this backend currently serves only the Expense Manager, so every
-- existing organization should already have an expense project. Idempotent.
-- ──────────────────────────────────────────────
insert into public.projects (organization_id, key, name, status)
select o.id, 'expense', 'Expense Manager', 'active'
from public.organizations o
on conflict (organization_id, key) do nothing;
