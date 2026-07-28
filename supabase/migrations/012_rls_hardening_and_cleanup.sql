-- ============================================================
-- 012 — RLS hardening & policy cleanup (non-critical, security layer only)
--
-- PROPOSED / REVIEWED — created as an artifact. NOT auto-applied to the DB.
-- Run it manually in the Supabase SQL Editor only after explicit approval.
--
-- Guarantees:
--   • No business-logic or table-structure changes.
--   • No behavior change for existing apps (projects writes are tightened, but
--     no client writes projects directly — ensureProject uses a SECURITY DEFINER
--     RPC that bypasses RLS, and every user is owner of their own org).
--   • Net policy count DECREASES (categories 6→2, organizations 3→2,
--     organization_members 2→1). Cleanups preserve identical security behavior.
--   • Fully idempotent / re-runnable (drop-if-exists before every create).
-- ============================================================

-- ──────────────────────────────────────────────
-- 1) Role primitive: is_org_admin(org_id)
-- Mirrors is_org_member exactly (SECURITY DEFINER / stable / search_path=public)
-- so role checks bypass RLS deterministically and never recurse. Centralizes the
-- owner/admin predicate in one place.
-- ──────────────────────────────────────────────
create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- ──────────────────────────────────────────────
-- 1b) Tighten writes on public.projects (least privilege)
-- Read = any member; Insert/Update/Delete = owner/admin only.
-- ──────────────────────────────────────────────
drop policy if exists "Members manage their org projects" on public.projects;

drop policy if exists "Members read their org projects" on public.projects;
create policy "Members read their org projects"
  on public.projects for select
  using (public.is_org_member(organization_id));

drop policy if exists "Admins insert org projects" on public.projects;
create policy "Admins insert org projects"
  on public.projects for insert
  with check (public.is_org_admin(organization_id));

drop policy if exists "Admins update org projects" on public.projects;
create policy "Admins update org projects"
  on public.projects for update
  using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

drop policy if exists "Admins delete org projects" on public.projects;
create policy "Admins delete org projects"
  on public.projects for delete
  using (public.is_org_admin(organization_id));

-- ──────────────────────────────────────────────
-- 2) public.profiles — add the missing self-only UPDATE policy
-- Fixes the functional gap (Settings name-save was blocked by RLS). The
-- WITH CHECK forbids re-pointing a row to another user's id.
-- (select auth.uid()) is the Supabase-recommended form for per-query eval.
-- ──────────────────────────────────────────────
drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ──────────────────────────────────────────────
-- 3) Cleanup redundant/overlapping policies — security behavior unchanged.
-- ──────────────────────────────────────────────

-- expense.categories : 6 → 2
-- Kept: "Members manage own-org categories" (ALL) + "Read global and own-org categories" (SELECT).
-- Dropped duplicates are subsumed: is_org_member(NULL) is false, so the plain
-- is_org_member INSERT/SELECT policies add nothing over the kept pair.
drop policy if exists "insert_categories"             on expense.categories;
drop policy if exists "members_can_insert_categories" on expense.categories;
drop policy if exists "members_can_view_categories"   on expense.categories;
drop policy if exists "view_categories"               on expense.categories;

-- public.organizations : 3 → 2
-- "Users can view their organizations" (subquery) is identical to
-- "Members can view their organizations" (is_org_member(id)). Keep the latter.
drop policy if exists "Users can view their organizations" on public.organizations;

-- public.organization_members : 2 → 1
-- "Users can view memberships" (user_id = auth.uid()) is a strict SUBSET of
-- "Members can view memberships of their orgs" (is_org_member). Keep the latter.
drop policy if exists "Users can view memberships" on public.organization_members;
