# Next Steps — Building New Applications on the Multi-Tenant Backbone

The backbone is stable. This is the playbook for adding the next applications
(Clinic, CMS, Solar, Skin Care, …) **without touching the core architecture**.

See `ARCHITECTURE.md` for the concepts referenced below.

---

## Golden rules (do not violate)

1. **Never** add app-specific logic to `handle_new_user()` or any signup trigger.
   The trigger only ever creates: profile + organization + owner membership.
2. **Never** create a per-app SQL function like `ensure_<app>_project`. Use the
   generic `public.ensure_project(org_id, key, name)` for every app.
3. Each app registers itself **at runtime** with one call:
   `projectsService.ensureProject(org.id, '<key>', '<Name>')`.
4. Keep each app's data in **its own Postgres schema** (`clinic.*`, `cms.*`, …),
   never in `public`. The `public` schema is backbone-only.
5. Reuse `public.is_org_member(organization_id)` in every new RLS policy. Do not
   invent a second membership check.
6. Introspect the **live** DB before writing SQL — the migration files have
   drifted (see `ARCHITECTURE.md` → Schema drift).

---

## Recipe: add a new application (e.g. "Clinic")

### 1. Data schema (SQL, one-time, in the live DB)
- `create schema if not exists clinic;`
- Create the app's tables in `clinic.*`, each with an
  `organization_id uuid not null references public.organizations(id) on delete cascade`.
- Grant API usage: `grant usage on schema clinic to anon, authenticated, service_role;`
  and add `clinic` to **Supabase → Settings → API → Exposed schemas**.

### 2. RLS (SQL, one-time)
- `alter table clinic.<table> enable row level security;`
- For each table:
  ```sql
  create policy "Members manage own-org <table>"
    on clinic.<table> for all
    using (public.is_org_member(organization_id))
    with check (public.is_org_member(organization_id));
  ```

### 3. Client wiring (TypeScript)
- Add a schema-bound client: `export const clinicDb = supabase.schema('clinic');`
- Build `clinic.*.service.ts` services against `clinicDb` (mirror the existing
  `expense` services).
- Declare the app identity and call `ensureProject` once after the org resolves,
  exactly like the Expense Manager does in `src/hooks/useAuth.ts`:
  ```ts
  projectsService.ensureProject(org.id, 'clinic', 'Clinic');
  ```

### 4. That's all
No change to `handle_new_user`, `ensure_project`, `projects`, `organizations`,
`organization_members`, or `is_org_member`.

---

## Backbone hardening backlog (do before scaling to many apps)

These are **not** required to ship, but should be addressed as the platform grows.

### A. Live RLS audit (do first)
Because the migration files are unreliable, verify the live security boundary by
running this in the Supabase SQL Editor and confirming every tenant table has RLS
**enabled** with the expected policies:

```sql
-- 1) RLS enabled per table
select n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public','expense')
  and c.relkind = 'r'
  and c.relname in ('profiles','organizations','organization_members','projects',
                    'categories','transactions','budgets')
order by 1,2;

-- 2) Policies and their predicates
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public','expense')
order by schemaname, tablename, policyname;

-- 3) SECURITY DEFINER functions and their search_path
select p.proname, p.prosecdef as security_definer, p.proconfig
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_org_member','ensure_project','handle_new_user');
```

Confirm: RLS = true everywhere; `profiles` has owner-scoped select/update;
`organizations` update policy targets the **real** column (`created_by`, not
`owner_id`); all three functions are `security_definer = true` with
`search_path=public`.

### B. Reconcile migrations with reality
The `.sql` files contradict the live DB. Create a single
`supabase/migrations/012_reconcile_live_schema.sql` (or reset the baseline) so the
repo is an accurate, replayable description of the live database. Until then,
treat the files as historical only.

### C. Role-aware project writes
`projects` RLS is currently `for all` to any member. Once organizations have
multiple users, restrict project create/archive/delete to `owner`/`admin` (add a
role check helper, e.g. `public.is_org_admin(org_id)`), keeping read open to all
members.

### D. Profile UPDATE column hygiene
`profiles` has no `updated_at`; the service was writing it (now fixed). If you add
audit columns later, add them to the live table first, then to the `Profile` type
and the service together.

### E. A projects registry / app catalog (optional)
If product needs a list of "which apps an org uses", read `public.projects`
(`projectsService.list(orgId)`) — it is already the per-org app registry. Consider
a small `app_catalog` lookup (`key → name, icon, route`) if the set of apps grows.

---

## What is explicitly out of scope right now
- No new product features.
- No database changes except the hardening items above, and only when a real
  defect or a new app requires them.
- No edits to the existing Expense Manager UI.
