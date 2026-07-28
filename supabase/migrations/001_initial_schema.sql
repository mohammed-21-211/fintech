-- ============================================================
-- Fintech App — Initial Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  avatar_url  text,
  currency    text not null default 'USD',
  language    text not null default 'en' check (language in ('en', 'ar')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade,
  name       text not null,
  icon       text not null default 'tag',
  color      text not null default '#888888',
  type       text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Users can manage own categories"
  on public.categories for all using (auth.uid() = user_id);

create policy "Users can view global categories"
  on public.categories for select using (user_id is null);

-- ──────────────────────────────────────────────
-- TRANSACTIONS
-- ──────────────────────────────────────────────
create table if not exists public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title       text not null,
  amount      numeric(15, 2) not null check (amount > 0),
  type        text not null check (type in ('income', 'expense')),
  date        date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all using (auth.uid() = user_id);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_date_idx on public.transactions(date desc);
create index if not exists transactions_type_idx on public.transactions(type);

-- ──────────────────────────────────────────────
-- BUDGETS
-- ──────────────────────────────────────────────
create table if not exists public.budgets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  amount      numeric(15, 2) not null check (amount > 0),
  spent       numeric(15, 2) not null default 0,
  period      text not null check (period in ('monthly', 'weekly', 'yearly')),
  start_date  date not null,
  end_date    date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users can manage own budgets"
  on public.budgets for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────
-- REALTIME
-- ──────────────────────────────────────────────
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.budgets;
