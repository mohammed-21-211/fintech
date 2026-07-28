import { expenseDb } from './supabase';
import type { Transaction, TransactionFilters, FinancialSummary, MonthlyData } from '../types';

export const transactionsService = {
  async getAll(organizationId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    let query = expenseDb
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('organization_id', organizationId)
      .order('date', { ascending: false });

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.category_id) query = query.eq('category_id', filters.category_id);
    if (filters?.start_date) query = query.gte('date', filters.start_date);
    if (filters?.end_date) query = query.lte('date', filters.end_date);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Transaction[]) || [];
  },

  async create(
    organizationId: string,
    createdBy: string,
    payload: Omit<
      Transaction,
      'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at' | 'category'
    >,
  ): Promise<Transaction> {
    const { data, error } = await expenseDb
      .from('transactions')
      .insert({ ...payload, organization_id: organizationId, created_by: createdBy })
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Transaction;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await expenseDb
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) throw error;
    return data as Transaction;
  },

  async delete(id: string): Promise<void> {
    const { error } = await expenseDb.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  async getSummary(organizationId: string): Promise<FinancialSummary> {
    const { data, error } = await expenseDb
      .from('transactions')
      .select('type, amount')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const transactions = data || [];
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return { totalIncome, totalExpenses, balance, savingsRate };
  },

  async getMonthlyData(organizationId: string, months = 6): Promise<MonthlyData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    const { data, error } = await expenseDb
      .from('transactions')
      .select('type, amount, date')
      .eq('organization_id', organizationId)
      .gte('date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    const grouped: Record<string, MonthlyData> = {};
    (data || []).forEach((t) => {
      const month = t.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = { month, income: 0, expenses: 0 };
      if (t.type === 'income') grouped[month].income += Number(t.amount);
      else grouped[month].expenses += Number(t.amount);
    });

    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  },
};
