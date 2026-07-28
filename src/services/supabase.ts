import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// PostgREST client bound to the `expense` schema (categories, transactions,
// budgets). Requires `expense` to be listed under Supabase →
// Settings → API → Exposed schemas, otherwise these queries 404.
// Auth, profiles, organizations and organization_members stay on the default
// `public` schema via the `supabase` client above.
export const expenseDb = supabase.schema('expense');

export type { SupabaseClient } from '@supabase/supabase-js';
