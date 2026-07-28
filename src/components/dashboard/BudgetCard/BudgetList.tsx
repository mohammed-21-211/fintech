import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { useBudgets } from '../../../hooks/useBudgets';
import { useCategories } from '../../../hooks/useCategories';
import { Button } from '../../ui/Button/Button';
import { Modal } from '../../ui/Modal/Modal';
import { Input, Select } from '../../ui/Input/Input';
import { formatCurrency, getMonthRange } from '../../../utils/formatters';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema } from '../../../utils/validators';
import type { BudgetFormData } from '../../../utils/validators';
import styles from './BudgetList.module.css';

const ICON_MAP: Record<string, string> = {
  salary: '💼', food: '🍕', transport: '🚗', housing: '🏠',
  shopping: '🛒', utilities: '💡', entertainment: '🎭',
  health: '❤️', education: '📚', travel: '✈️', other: '📌',
};

export function BudgetList() {
  const { t } = useTranslation();
  const { budgets, create, remove } = useBudgets();
  const { categories } = useCategories('expense');
  const [modalOpen, setModalOpen] = useState(false);

  const range = getMonthRange();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
      start_date: range.start,
      end_date: range.end,
    },
  });

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const onSubmit = async (data: BudgetFormData) => {
    await create(data);
    reset();
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this budget?')) await remove(id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('budget.title')}</h1>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          {t('budget.createBudget')}
        </Button>
      </div>

      <div className={styles.grid}>
        {budgets.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎯</span>
            <span className={styles.emptyTitle}>{t('budget.noBudgets')}</span>
            <span className={styles.emptyDesc}>{t('budget.noBudgetsHint')}</span>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
              {t('budget.createBudget')}
            </Button>
          </div>
        ) : (
          budgets.map((b) => {
            const pct = Math.min((b.spent / b.amount) * 100, 100);
            const isOver = b.spent > b.amount;
            const isNear = pct >= 80;
            const catName = b.category?.name?.toLowerCase() ?? 'other';

            return (
              <div key={b.id} className={[styles.card, isOver ? styles.overBudget : ''].join(' ')}>
                <div className={styles.cardHeader}>
                  <div className={styles.catInfo}>
                    <div className={styles.catIcon}>{ICON_MAP[catName] ?? '📌'}</div>
                    <span className={styles.catName}>{b.category?.name ?? 'Budget'}</span>
                  </div>
                  <span className={styles.period}>{t(`budget.${b.period}`)}</span>
                </div>

                <div className={styles.amounts}>
                  <div>
                    <div className={styles.spent}>{formatCurrency(b.spent)}</div>
                  </div>
                  <div className={styles.budget}>of {formatCurrency(b.amount)}</div>
                </div>

                <div className={styles.bar}>
                  <div
                    className={[
                      styles.barFill,
                      isOver ? styles.over : isNear ? styles.warn : '',
                    ].filter(Boolean).join(' ')}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className={styles.cardFooter}>
                  <span className={[
                    styles.remaining,
                    isOver ? styles.overLimit : isNear ? styles.nearLimit : styles.onTrack,
                  ].filter(Boolean).join(' ')}>
                    {isOver
                      ? `${formatCurrency(b.spent - b.amount)} ${t('budget.overBudget')}`
                      : `${formatCurrency(b.amount - b.spent)} ${t('budget.remaining')}`}
                  </span>

                  <div className={styles.actions}>
                    <button
                      className={[styles.actionBtn, styles.deleteBtn].join(' ')}
                      onClick={() => handleDelete(b.id)}
                      aria-label="Delete budget"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('budget.createBudget')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{t('transaction.cancel')}</Button>
            <Button form="budget-form" type="submit" loading={isSubmitting}>
              {t('transaction.save')}
            </Button>
          </>
        }
      >
        <form id="budget-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select
                label={t('budget.category')}
                placeholder="Select category"
                options={catOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.category_id?.message}
              />
            )}
          />

          <Input
            label={t('budget.amount')}
            type="number"
            step="1"
            min="1"
            placeholder="500"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <Select
                label={t('budget.period')}
                options={[
                  { value: 'monthly', label: t('budget.monthly') },
                  { value: 'weekly',  label: t('budget.weekly') },
                  { value: 'yearly',  label: t('budget.yearly') },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </form>
      </Modal>
    </div>
  );
}
