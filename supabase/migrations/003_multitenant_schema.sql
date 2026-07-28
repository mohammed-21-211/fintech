-- ============================================================
-- Fintech App — Multi-tenant schema
-- Adds: public.organizations, public.organization_members,
--       and the `expense` schema (categories, transactions, budgets).
-- The old public.categories/transactions/budgets (migrations 001/002)
-- are superseded by the `expense.*` tables below.
-- ============================================================

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase).
create extension if not exists "pgcrypto";

-- Tenant data lives in its own schema.
create schema if not exists expense;

-- ──────────────────────────────────────────────
-- ORGANIZATIONS  (a tenant)
-- ──────────────────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- ORGANIZATION MEMBERS  (which user belongs to which tenant)
-- ──────────────────────────────────────────────
create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_idx on public.organization_members(user_id);
create index if not exists organization_members_org_idx  on public.organization_members(organization_id);

-- ──────────────────────────────────────────────
-- EXPENSE.CATEGORIES  (organization_id null = global/default)
-- ──────────────────────────────────────────────
create table if not exists expense.categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name            text not null,
  icon            text not null default 'tag',
  color           text not null default '#888888',
  type            text not null check (type in ('income', 'expense')),
  created_at      timestamptz not null default now()
);

create index if not exists categories_org_idx on expense.categories(organization_id);
-- Supports upsert(onConflict: 'organization_id,name') for per-org seeding.
create unique index if not exists categories_org_name_key
  on expense.categories(organization_id, name);

-- ──────────────────────────────────────────────
-- EXPENSE.TRANSACTIONS
-- ──────────────────────────────────────────────
create table if not exists expense.transactions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by      uuid references auth.users(id) on delete set null,
  category_id     uuid references expense.categories(id) on delete set null,
  title           text not null,
  amount          numeric(15, 2) not null check (amount > 0),
  type            text not null check (type in ('income', 'expense')),
  date            date not null default current_date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists transactions_org_idx        on expense.transactions(organization_id);
create index if not exists transactions_created_by_idx on expense.transactions(created_by);
create index if not exists transactions_date_idx       on expense.transactions(date desc);
create index if not exists transactions_type_idx       on expense.transactions(type);

-- ──────────────────────────────────────────────
-- EXPENSE.BUDGETS
-- ──────────────────────────────────────────────
create table if not exists expense.budgets (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by      uuid references auth.users(id) on delete set null,
  category_id     uuid not null references expense.categories(id) on delete cascade,
  amount          numeric(15, 2) not null check (amount > 0),
  spent           numeric(15, 2) not null default 0,
  period          text not null check (period in ('monthly', 'weekly', 'yearly')),
  start_date      date not null,
  end_date        date not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists budgets_org_idx        on expense.budgets(organization_id);
create index if not exists budgets_created_by_idx on expense.budgets(created_by);

-- ──────────────────────────────────────────────
-- AUTO-UPDATE updated_at  (reuse the helper from migration 001)
-- ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

drop trigger if exists set_expense_transactions_updated_at on expense.transactions;
create trigger set_expense_transactions_updated_at
  before update on expense.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists set_expense_budgets_updated_at on expense.budgets;
create trigger set_expense_budgets_updated_at
  before update on expense.budgets
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────
-- API GRANTS for the new schema
-- RLS (migration 004) remains the real security boundary; these grants
-- only let the PostgREST roles reach the schema at all.
--
-- NOTE: You must ALSO add `expense` to Settings → API → Exposed schemas
-- in the Supabase dashboard, otherwise the client cannot query it.
-- ──────────────────────────────────────────────
grant usage on schema expense to anon, authenticated, service_role;
grant all on all tables in schema expense to anon, authenticated, service_role;
alter default privileges in schema expense
  grant all on tables to anon, authenticated, service_role;
