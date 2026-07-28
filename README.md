# Fintech — Professional Financial Management System

A production-grade financial management web app built with **React + Vite**, **Supabase** (free tier), full **Arabic/English RTL/LTR** support, and pixel-accurate implementation of the Figma design.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Supabase Setup](#supabase-setup)
3. [Project Architecture](#project-architecture)
4. [Data Flow Diagram](#data-flow-diagram)
5. [Feature Overview](#feature-overview)
6. [Dependencies Rationale](#dependencies-rationale)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Security Model (RLS)](#security-model-rls)
9. [Deployment](#deployment)
10. [Adding New Features](#adding-new-features)

---

## Quick Start

```bash
# 1. Clone / enter the project
cd fintech

# 2. Install dependencies
npm install

# 3. Copy env file and fill in your Supabase keys
cp .env.example .env

# 4. Run migrations in your Supabase SQL editor (see Supabase Setup)

# 5. Start the dev server
npm run dev
```

Open `http://localhost:5173`.

---

## Supabase Setup

### 1. Create a free Supabase project

Go to [supabase.com](https://supabase.com) → **New Project**. The free tier supports:
- 500 MB database
- 1 GB storage
- 50,000 monthly active users
- Unlimited API requests

### 2. Run migrations

In your Supabase dashboard go to **SQL Editor** and run the files in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_seed_categories.sql
```

### 3. Copy your credentials

From **Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Paste into your `.env` file.

### 4. Enable Email Auth

**Authentication → Providers → Email** — enable it (it's on by default). No SMTP setup needed for development (Supabase sends confirmation emails for you on the free tier).

---

## Project Architecture

```
src/
├── components/
│   ├── ui/             # Reusable primitives (Button, Input, Modal, Toast, …)
│   ├── layout/         # Structural shells (Navbar, Sidebar, Footer)
│   ├── landing/        # Landing page sections (Hero, Features, CTA, …)
│   ├── dashboard/      # Dashboard feature components
│   └── auth/           # Login / Signup forms
│
├── hooks/              # Business logic (useAuth, useTransactions, useBudgets, …)
├── services/           # Supabase API layer (one file per domain)
├── store/              # Zustand global state (persisted preferences)
├── i18n/               # i18next config + EN/AR translation files
├── types/              # Shared TypeScript interfaces
├── utils/              # Pure helpers (formatters, Zod validators)
└── pages/              # Route-level page wrappers

supabase/
└── migrations/         # SQL schema + seed data (run once in Supabase SQL editor)
```

### Layering rules

```
Page
  └── Feature Component   (reads from store / calls hooks)
       └── UI Component   (stateless, CSS Modules only)
            └── Hook      (business logic, calls service)
                 └── Service  (raw Supabase calls)
                      └── Supabase client (singleton)
```

---

## Data Flow Diagram

```
User Action (click/form submit)
       │
       ▼
React Component  ──► Zustand Store (optimistic UI update)
       │
       ▼
Custom Hook  (useTransactions / useBudgets / useAuth)
       │
       ▼
Service Layer  (transactions.service.ts)
       │
       ▼
Supabase JS Client
       │
       ├── PostgreSQL (RLS enforces user isolation)
       │
       └── Realtime subscription (pushes back to store on change)
```

---

## Feature Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Landing page (Figma) | ✅ | Dark theme, lime accent, responsive |
| Email/Password Auth | ✅ | Supabase Auth |
| Protected routes | ✅ | Redirects unauthenticated users |
| Dashboard overview | ✅ | Balance, income, expenses, savings rate |
| Transaction CRUD | ✅ | Add, edit, delete; 2-click flow |
| Category system | ✅ | Global defaults + per-user custom |
| Budgets | ✅ | Progress bars, over-budget alerts |
| Analytics charts | ✅ | Income vs Expenses area chart (Recharts) |
| i18n EN / AR | ✅ | RTL layout, font switch, persisted |
| Toast notifications | ✅ | Success / Error / Warning / Info |
| Error boundaries | ✅ | Global + per-section recovery |
| Zod validation | ✅ | Frontend forms + type-safe API payloads |
| Row Level Security | ✅ | Users only see their own data |
| Responsive design | ✅ | Mobile sidebar + stacked grids |
| CSS Modules only | ✅ | Zero inline styles |

---

## Dependencies Rationale

| Package | Why |
|---------|-----|
| `vite` | Sub-second HMR, native ESM, no config needed |
| `react-router-dom` | Nested layouts, protected routes via `<Outlet>` |
| `@supabase/supabase-js` | Free-tier Postgres + Auth + Realtime in one SDK |
| `zustand` | Tiny state manager; persistence middleware for preferences |
| `react-hook-form` | Uncontrolled forms = zero re-renders per keystroke |
| `@hookform/resolvers` + `zod` | Schema-first validation shared between form & service layer |
| `react-i18next` + `i18next` | Industry-standard i18n with language detection |
| `recharts` | Composable SVG charts, tree-shakable, React-native |
| `lucide-react` | Consistent 1px-stroke icon set, tree-shaken automatically |

---

## Internationalization (i18n)

Language files live in `src/i18n/locales/`:
- `en.json` — English strings
- `ar.json` — Arabic strings (fully translated)

To switch language programmatically:

```ts
import { setLanguage } from '@/i18n';
setLanguage('ar'); // also flips dir="rtl" on <html>
```

The user's preference is persisted to `localStorage` via Zustand's `persist` middleware.

### Adding a new language

1. Create `src/i18n/locales/fr.json` (copy `en.json` and translate)
2. Register it in `src/i18n/index.ts`:
   ```ts
   import fr from './locales/fr.json';
   resources: { en: ..., ar: ..., fr: { translation: fr } }
   ```
3. Add the option to `src/pages/Settings/Settings.tsx`

---

## Security Model (RLS)

Every table has Row Level Security enabled in Postgres:

```sql
-- Example: transactions
create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id);
```

The Supabase `anon` key is safe to expose in frontend code **because RLS prevents any user from reading or writing another user's rows**, even if they know the key.

**Never** use the `service_role` key on the frontend.

---

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set env vars in Vercel dashboard:
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

Add a `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify

```bash
npm run build
# drag-drop the dist/ folder to app.netlify.com/drop
```

Or create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Adding New Features

### New dashboard page (e.g. Reports)

1. Create `src/pages/Reports/Reports.tsx` + `Reports.module.css`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="reports" element={<ReportsPage />} />
   ```
3. Add nav item in `src/components/layout/Sidebar/Sidebar.tsx`
4. Add translation keys to both locale files

### New data entity (e.g. Recurring Payments)

1. Add migration in `supabase/migrations/003_recurring.sql`
2. Add TypeScript interface to `src/types/index.ts`
3. Create `src/services/recurring.service.ts`
4. Create `src/hooks/useRecurring.ts`
5. Add slice to `src/store/index.ts`

No existing code needs to change — the layered architecture keeps additions isolated.
