# Architecture — Multi-Tenant Backbone

This backend is a **generic, multi-tenant platform**. The Expense Manager is just
the *first* application built on top of it. The same backbone is meant to host
unlimited future applications (Clinic, CMS, Solar, Skin Care, …) **without any
SQL or trigger changes** — each app registers itself at runtime via
`ensureProject()`.

> ⚠️ **Source of truth:** the *live* Supabase database is authoritative, **not**
> the `supabase/migrations/*.sql` files, which have drifted from reality (see
> [Schema drift](#schema-drift)). Always introspect the live schema before
> writing SQL.

---

## The three core concepts

### 1. Organizations (the tenant)

An **organization** is the unit of isolation. Every piece of application data is
scoped to exactly one organization. On signup, each user automatically gets a
personal organization.

Live `public.organizations`:

| column       | notes                                              |
|--------------|----------------------------------------------------|
| `id`         | uuid, PK                                           |
| `name`       | display name (e.g. "Sara's Organization")          |
| `slug`       | optional                                           |
| `created_by` | the owning user (`auth.users.id`) — **not** `owner_id` |
| `created_at` | timestamp                                          |

### 2. Organization Members (who belongs to a tenant + their role)

**Membership** links a user to an organization with a role. This is the basis of
every authorization decision in the system.

Live `public.organization_members`:

| column            | notes                                            |
|-------------------|--------------------------------------------------|
| `id`              | uuid, PK                                         |
| `organization_id` | → `organizations.id`                             |
| `user_id`         | → `auth.users.id`                                |
| `role`            | `'owner' \| 'admin' \| 'member'` (default `member`) |
| `created_at`      | timestamp                                        |

The single security primitive `public.is_org_member(org_id)` answers *"is the
current user a member of this org?"* and is reused by every RLS policy:

```sql
create function public.is_org_member(org_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.organization_members m
  where m.organization_id = org_id and m.user_id = auth.uid()
); $$;
```

It is `SECURITY DEFINER` so it bypasses RLS and cannot recurse when used inside
`organization_members`' own policy.

### 3. Projects (per-app footprint inside a tenant)

A **project** is how an application declares *"I exist for this organization."*
One row per `(organization_id, key)`. The `key` is the app's stable machine id
(`'expense'`, `'clinic'`, …); `name` is the display label.

Live `public.projects`:

| column            | notes                                       |
|-------------------|---------------------------------------------|
| `id`              | uuid, PK                                     |
| `organization_id` | → `organizations.id` (on delete cascade)    |
| `key`             | app machine id, **unique per organization**  |
| `name`            | display label                               |
| `status`         | `'active' \| 'archived'`                     |
| `created_at`      | timestamp                                   |

`unique (organization_id, key)` is what makes provisioning idempotent.

---

## Signup flow — strictly tenant primitives, app-agnostic

`public.handle_new_user()` runs on `auth.users` insert (`SECURITY DEFINER`). It
knows **nothing** about Expense, Clinic, CMS, or any application. It only creates
the tenant primitives:

```
auth.users INSERT
        │
        ▼
handle_new_user()
        ├── 1. profile               (public.profiles)
        ├── 2. organization          (public.organizations, created_by = new user)
        └── 3. owner membership       (public.organization_members, role = 'owner')
```

That's it. No project is created by the trigger.

---

## How an application registers itself — `ensureProject()`

Each application provisions its own project **at runtime**, from the client,
after the user's organization is resolved. Two layers:

**SQL primitive** — generic, idempotent, tenant-guarded:

```sql
create function public.ensure_project(org_id uuid, project_key text, project_name text)
returns public.projects
language plpgsql security definer set search_path = public
as $$
declare result public.projects;
begin
  -- tenant guard: SECURITY DEFINER bypasses RLS, so re-assert the boundary
  if not public.is_org_member(org_id) then
    raise exception 'not a member of organization %', org_id using errcode = '42501';
  end if;

  insert into public.projects (organization_id, key, name, status)
  values (org_id, project_key, project_name, 'active')
  on conflict (organization_id, key) do nothing
  returning * into result;

  if result.id is null then               -- already existed
    select * into result from public.projects
    where organization_id = org_id and key = project_key;
  end if;
  return result;
end; $$;
```

**Client service** — application-agnostic wrapper:

```ts
// src/services/projects.service.ts
projectsService.ensureProject(organizationId, projectKey, projectName)
```

### Adding a brand-new application

No database work. The new app only declares its identity and calls the same
service once per session after the org is known:

```ts
// Expense Manager (today) — see src/hooks/useAuth.ts
projectsService.ensureProject(org.id, 'expense', 'Expense Manager');

// Future apps — same call, different key, zero SQL/trigger changes:
projectsService.ensureProject(org.id, 'clinic', 'Clinic');
projectsService.ensureProject(org.id, 'cms',    'CMS');
projectsService.ensureProject(org.id, 'solar',  'Solar');
```

The call is **idempotent**: safe to run on every sign-in. It creates the project
the first time and returns the existing row thereafter.

---

## Where application data lives

Tenant *application* data lives in its own Postgres schema, separate from the
`public` backbone. The Expense Manager uses the `expense` schema
(`expense.categories`, `expense.transactions`, `expense.budgets`) reached via a
schema-bound client:

```ts
export const expenseDb = supabase.schema('expense'); // src/services/supabase.ts
```

A future app would get its own schema (e.g. `clinic.*`) and its own
schema-bound client, while sharing the `public` backbone (auth, organizations,
members, projects) and the `is_org_member` security primitive.

```
public  ── backbone (shared by ALL apps) ── profiles · organizations · organization_members · projects
expense ── Expense Manager data ─────────── categories · transactions · budgets
clinic  ── (future) Clinic data ─────────── …
```

---

## Security model (RLS)

The browser ships the **anon key**, so Row-Level Security is the real security
boundary — not the client code.

- Every tenant table has RLS enabled and gates access through
  `public.is_org_member(organization_id)`.
- `public.projects` policy *"Members manage their org projects"* (`for all`)
  scopes all access to org members.
- Global/shared rows (e.g. default categories with `organization_id is null`)
  are readable by everyone but writable by no client.
- `SECURITY DEFINER` functions (`is_org_member`, `ensure_project`,
  `handle_new_user`) all pin `search_path = public` and re-assert membership
  where they bypass RLS.

See `NEXT_STEPS.md` for the live-RLS audit checklist and known hardening items.

---

## Schema drift

The repo's `supabase/migrations/*.sql` do **not** match the live database and are
internally contradictory (e.g. `004` vs `010` disagree on `owner_id` vs
`created_by`). Confirmed differences in the live DB:

- `organizations` uses `created_by` (no `owner_id`), and has a `slug` column.
- `profiles` has only `id, email, full_name, avatar_url, created_at`
  (no `currency`, `language`, or `updated_at`).
- `projects` + its RLS were created in-session, not by `007`/`008`.

**Rule:** introspect `information_schema.columns` / `pg_policies` against the live
DB before authoring SQL. A reconciliation migration to realign the files with
reality is tracked in `NEXT_STEPS.md`.
