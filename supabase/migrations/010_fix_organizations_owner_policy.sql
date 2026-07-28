-- ============================================================
-- Fintech App — Fix organizations owner update policy
-- Migration 004 created "Owners can update their organization" with
-- `using (created_by = auth.uid())`, but public.organizations has no
-- created_by column (it defines owner_id; see migration 003). On a clean
-- database that create policy fails to apply. This migration drops the
-- policy if it exists and recreates it against the correct column.
-- Safe to run whether 004 applied the broken policy or never created it.
-- ============================================================

drop policy if exists "Owners can update their organization" on public.organizations;

-- Wrap auth.uid() in a scalar subselect so Postgres evaluates it once per
-- query instead of once per row (Supabase RLS performance guidance).
create policy "Owners can update their organization"
  on public.organizations for update
  using (owner_id = (select auth.uid()));
