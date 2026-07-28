-- ============================================================
-- Fintech App — Multi-tenant RLS
-- Tenant isolation is enforced here. The browser ships the anon key,
-- so these policies are the real security boundary.
-- ============================================================

-- Membership check used by every tenant policy.
-- SECURITY DEFINER so it bypasses RLS and therefore cannot recurse
-- when used inside organization_members' own policy.
create or replace function public.is_org_member(org_id uuid)
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
  );
$$;

-- ──────────────────────────────────────────────
-- ORGANIZATIONS
-- ──────────────────────────────────────────────
alter table public.organizations enable row level security;

create policy "Members can view their organizations"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "Owners can update their organization"
  on public.organizations for update
  using (owner_id = auth.uid());

-- Inserts are done by the signup trigger (SECURITY DEFINER), not the client.

-- ──────────────────────────────────────────────
-- ORGANIZATION_MEMBERS
-- ──────────────────────────────────────────────
alter table public.organization_members enable row level security;

-- A user can see the membership rows of any org they belong to.
-- is_org_member is SECURITY DEFINER, so this does not recurse.
create policy "Members can view memberships of their orgs"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

-- Member management (invites etc.) is handled by the signup trigger / service
-- role for now; no client-side write policy until a members UI exists.

-- ──────────────────────────────────────────────
-- EXPENSE.CATEGORIES
-- Global rows (organization_id is null) are readable by everyone;
-- only org members can write their own org's rows.
-- ──────────────────────────────────────────────
alter table expense.categories enable row level security;

create policy "Read global and own-org categories"
  on expense.categories for select
  using (organization_id is null or public.is_org_member(organization_id));

create policy "Members manage own-org categories"
  on expense.categories for all
  using (organization_id is not null and public.is_org_member(organization_id))
  with check (organization_id is not null and public.is_org_member(organization_id));

-- ──────────────────────────────────────────────
-- EXPENSE.TRANSACTIONS
-- ──────────────────────────────────────────────
alter table expense.transactions enable row level security;

create policy "Members manage own-org transactions"
  on expense.transactions for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ──────────────────────────────────────────────
-- EXPENSE.BUDGETS
-- ──────────────────────────────────────────────
alter table expense.budgets enable row level security;

create policy "Members manage own-org budgets"
  on expense.budgets for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
