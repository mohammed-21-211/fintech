-- ============================================================
-- Fintech App — Projects RLS
-- Tenant isolation for public.projects. The browser ships the anon key, so
-- these policies are the real security boundary. Reuses the SECURITY DEFINER
-- helper public.is_org_member(org_id) from migration 004.
-- ============================================================

alter table public.projects enable row level security;

-- Members of an org can read and manage that org's projects. The signup
-- trigger inserts the default project as SECURITY DEFINER (bypassing RLS), so
-- this policy mainly covers reads and any future client-side project management.
create policy "Members manage their org projects"
  on public.projects for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
