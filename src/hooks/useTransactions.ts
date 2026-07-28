import { useState, useCallback, useEffect, useRef } from 'react';
import { transactionsService } from '../services/transactions.service';
import { useAppStore } from '../store';
import type { TransactionFilters } from '../types';
import type { TransactionFormData } from '../utils/validators';

export function useTransactions(filters?: TransactionFilters) {
  const {
    user,
    organization,
    transactions,
    transactionsLoading,
    setTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setTransactionsLoading,
    setSummary,
    setMonthlyData,
    addToast,
  } = useAppStore();

  const [reloadKey, setReloadKey] = useState(0);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    if (!organization) return;

    let cancelled = false;
    const currentFilters = filtersRef.current;

    setTransactionsLoading(true);

    Promise.all([
      transactionsService.getAll(organization.id, currentFilters),
      transactionsService.getSummary(organization.id),
      transactionsService.getMonthlyData(organization.id),
    ])
      .then(([data, summary, monthly]) => {
        if (cancelled) return;
        setTransactions(data);
        setSummary(summary);
        setMonthlyData(monthly);
      })
      .catch(() => {
        if (!cancelled) addToast({ type: 'error', title: 'Failed to load transactions' });
      })
      .finally(() => {
        if (!cancelled) setTransactionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // organization?.id (string) instead of organization (object) — prevents
    // re-run when the store sets a new object reference with the same org id,
    // which would otherwise restart the loading cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const create = async (data: TransactionFormData) => {
    if (!organization || !user) return;
    try {
      const tx = await transactionsService.create(organization.id, user.id, {
        title: data.title,
        amount: data.amount,
        type: data.type,
        category_id: data.category_id ?? null,
        date: data.date,
        notes: data.notes ?? null,
      });
      addTransaction(tx);
      const summary = await transactionsService.getSummary(organization.id);
      setSummary(summary);
      addToast({ type: 'success', title: 'Transaction added' });
    } catch {
      addToast({ type: 'error', title: 'Failed to add transaction' });
      throw new Error('create failed');
    }
  };

  const update = async (id: string, data: Partial<TransactionFormData>) => {
    try {
      const tx = await transactionsService.update(id, data as Parameters<typeof transactionsService.update>[1]);
      updateTransaction(tx);
      addToast({ type: 'success', title: 'Transaction updated' });
    } catch {
      addToast({ type: 'error', title: 'Failed to update transaction' });
      throw new Error('update failed');
    }
  };

  const remove = async (id: string) => {
    try {
      await transactionsService.delete(id);
      removeTransaction(id);
      if (organization) {
        const summary = await transactionsService.getSummary(organization.id);
        setSummary(summary);
      }
      addToast({ type: 'success', title: 'Transaction deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete transaction' });
    }
  };

  return { transactions, loading: transactionsLoading, create, update, remove, reload };
}

// Re-export TransactionFormData for convenience
export type { TransactionFormData } from '../utils/validators';
