import { useCallback, useEffect } from 'react';
import { budgetsService } from '../services/budgets.service';
import { useAppStore } from '../store';
import type { BudgetFormData } from '../utils/validators';

export function useBudgets() {
  const {
    user,
    organization,
    budgets,
    budgetsLoading,
    setBudgets,
    addBudget,
    updateBudget,
    removeBudget,
    setBudgetsLoading,
    addToast,
  } = useAppStore();

  const load = useCallback(async () => {
    if (!organization) return;
    setBudgetsLoading(true);
    try {
      const data = await budgetsService.getAll(organization.id);
      setBudgets(data);
    } catch {
      addToast({ type: 'error', title: 'Failed to load budgets' });
    } finally {
      setBudgetsLoading(false);
    }
  }, [organization, setBudgets, setBudgetsLoading, addToast]);

  useEffect(() => { load(); }, [load]);

  const create = async (data: BudgetFormData) => {
    if (!organization || !user) return;
    try {
      const b = await budgetsService.create(organization.id, user.id, data);
      addBudget(b);
      addToast({ type: 'success', title: 'Budget created' });
    } catch {
      addToast({ type: 'error', title: 'Failed to create budget' });
      throw new Error('create failed');
    }
  };

  const update = async (id: string, data: Partial<BudgetFormData>) => {
    try {
      const b = await budgetsService.update(id, data as Parameters<typeof budgetsService.update>[1]);
      updateBudget(b);
      addToast({ type: 'success', title: 'Budget updated' });
    } catch {
      addToast({ type: 'error', title: 'Failed to update budget' });
      throw new Error('update failed');
    }
  };

  const remove = async (id: string) => {
    try {
      await budgetsService.delete(id);
      removeBudget(id);
      addToast({ type: 'success', title: 'Budget deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete budget' });
    }
  };

  return { budgets, loading: budgetsLoading, create, update, remove, reload: load };
}
