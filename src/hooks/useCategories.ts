import { useCallback, useEffect } from 'react';
import { categoriesService } from '../services/categories.service';
import { useAppStore } from '../store';
import type { TransactionType } from '../types';

export function useCategories(type?: TransactionType) {
  const { organization, categories, setCategories } = useAppStore();

  const load = useCallback(async () => {
    if (!organization) return;
    try {
      const data = type
        ? await categoriesService.getByType(organization.id, type)
        : await categoriesService.getAll(organization.id);
      setCategories(data);
    } catch {
      /* silent */
    }
  }, [organization, type, setCategories]);

  useEffect(() => { load(); }, [load]);

  return { categories };
}
