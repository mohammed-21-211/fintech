import { supabase } from './supabase';
import type { Project } from '../types';

// `projects` lives in the public schema, so it uses the default `supabase`
// client (unlike categories/transactions/budgets which use `expenseDb`).
//
// This service is intentionally application-agnostic: it knows nothing about
// the Expense Manager (or Clinic / CMS / Solar / ...). Each application calls
// `ensureProject(orgId, key, name)` with its own key and display name.
export const projectsService = {
  // Every project the signed-in user can see, scoped by RLS to their org(s).
  async list(organizationId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Project[]) ?? [];
  },

  // Idempotently ensure the org has a project with the given key, creating it
  // only if it doesn't already exist, and return the (new or existing) row.
  //
  // Delegates to the generic `public.ensure_project` SQL primitive so the
  // create-if-missing logic and its idempotency guarantee live in one place.
  // The same call works for any application — `ensureProject(org, 'clinic',
  // 'Clinic')`, `ensureProject(org, 'cms', 'CMS')`, etc. — with no SQL or
  // trigger changes.
  async ensureProject(
    organizationId: string,
    projectKey: string,
    projectName: string,
  ): Promise<Project> {
    const { data, error } = await supabase
      .rpc('ensure_project', {
        org_id: organizationId,
        project_key: projectKey,
        project_name: projectName,
      })
      .single();
    if (error) throw error;
    return data as Project;
  },
};
