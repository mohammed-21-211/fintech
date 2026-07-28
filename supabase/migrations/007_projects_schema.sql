-- ============================================================
-- Fintech App — Projects
-- A project is a unit of work that belongs to exactly one organization
-- (tenant). Each application built on top of this multi-tenant backend
-- (Expense Manager today, others later) provisions its own project per
-- organization, identified by a stable, per-org-unique `key`.
-- ============================================================

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase).
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────
-- PROJECTS
-- One row per (organization, key). `key` is the machine identifier an app
-- uses to find/own its project (e.g. 'expense'); `name` is the display label.
-- ──────────────────────────────────────────────
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key             text not null,
  name            text not null,
  status          text not null default 'active' check (status in ('active', 'archived')),
  created_at      timestamptz not null default now(),
  -- `key` is unique per organization (two orgs may each have an 'expense' project).
  unique (organization_id, key)
);

-- The composite unique index above leads with organization_id, so it already
-- serves org-scoped lookups and the organizations on-delete cascade; no
-- separate organization_id index is needed.
