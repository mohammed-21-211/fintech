import { expenseDb } from './supabase';
import type { Category, TransactionType } from '../types';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'organization_id' | 'created_at'>[] = [
  { name: 'Salary', icon: 'briefcase', color: '#4ADE80', type: 'income' },
  { name: 'Freelance', icon: 'laptop', color: '#60A5FA', type: 'income' },
  { name: 'Investment', icon: 'trending-up', color: '#A78BFA', type: 'income' },
  { name: 'Food', icon: 'utensils', color: '#FB923C', type: 'expense' },
  { name: 'Transport', icon: 'car', color: '#FACC15', type: 'expense' },
  { name: 'Housing', icon: 'home', color: '#F87171', type: 'expense' },
  { name: 'Health', icon: 'heart', color: '#EC4899', type: 'expense' },
  { name: 'Education', icon: 'book', color: '#6EE7B7', type: 'expense' },
  { name: 'Entertainment', icon: 'film', color: '#C084FC', type: 'expense' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#F472B6', type: 'expense' },
  { name: 'Utilities', icon: 'zap', color: '#38BDF8', type: 'expense' },
  { name: 'Travel', icon: 'plane', color: '#34D399', type: 'expense' },
  { name: 'Other', icon: 'more-horizontal', color: '#94A3B8', type: 'expense' },
];

// Deduplicate categories by name (case-insensitive), preferring org-specific
// rows over globals so a tenant's customizations win when both exist.
function dedupeByName(rows: Category[]): Category[] {
  const byName = new Map<string, Category>();
  for (const row of rows) {
    const key = row.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (!existing || (!existing.organization_id && row.organization_id)) {
      byName.set(key, row);
    }
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const categoriesService = {
  async getAll(organizationId: string): Promise<Category[]> {
    const { data, error } = await expenseDb
      .from('categories')
      .select('*')
      .or(`organization_id.eq.${organizationId},organization_id.is.null`)
      .order('name');
    if (error) throw error;
    return dedupeByName((data as Category[]) || []);
  },

  async getByType(organizationId: string, type: TransactionType): Promise<Category[]> {
    const { data, error } = await expenseDb
      .from('categories')
      .select('*')
      .or(`organization_id.eq.${organizationId},organization_id.is.null`)
      .eq('type', type)
      .order('name');
    if (error) throw error;
    return dedupeByName((data as Category[]) || []);
  },

  async seedDefaults(organizationId: string): Promise<void> {
    // Skip seeding if global defaults already cover the names — avoids creating
    // org-specific duplicates of the globals shipped in migration 006.
    const { data: globals, error: globalsErr } = await expenseDb
      .from('categories')
      .select('name')
      .is('organization_id', null);
    if (globalsErr) throw globalsErr;

    const existingNames = new Set(
      (globals ?? []).map((g) => (g.name as string).trim().toLowerCase()),
    );
    const missing = DEFAULT_CATEGORIES.filter(
      (c) => !existingNames.has(c.name.trim().toLowerCase()),
    );
    if (missing.length === 0) return;

    const { data: orgRows, error: orgErr } = await expenseDb
      .from('categories')
      .select('name')
      .eq('organization_id', organizationId);
    if (orgErr) throw orgErr;

    const orgNames = new Set(
      (orgRows ?? []).map((r) => (r.name as string).trim().toLowerCase()),
    );
    const rows = missing
      .filter((c) => !orgNames.has(c.name.trim().toLowerCase()))
      .map((c) => ({ ...c, organization_id: organizationId }));
    if (rows.length === 0) return;

    const { error } = await expenseDb
      .from('categories')
      .upsert(rows, { onConflict: 'organization_id,name', ignoreDuplicates: true });
    if (error) throw error;
  },
};
