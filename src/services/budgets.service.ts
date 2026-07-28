import { expenseDb } from './supabase';
import type { Budget } from '../types';

export const budgetsService = {
  async getAll(organizationId: string): Promise<Budget[]> {
    const { data, error } = await expenseDb
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Budget[]) || [];
  },

  async create(
    organizationId: string,
    createdBy: string,
    payload: Omit<
      Budget,
      'id' | 'organization_id' | 'created_by' | 'spent' | 'created_at' | 'updated_at' | 'category'
    >,
  ): Promise<Budget> {
    const { data, error } = await expenseDb
      .from('budgets')
      .insert({ ...payload, organization_id: organizationId, created_by: createdBy, spent: 0 })
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Budget;
  },

  async update(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await expenseDb
      .from('budgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Budget;
  },

  async delete(id: string): Promise<void> {
    const { error } = await expenseDb.from('budgets').delete().eq('id', id);
    if (error) throw error;
  },
};
