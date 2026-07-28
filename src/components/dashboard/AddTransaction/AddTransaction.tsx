import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { transactionSchema } from '../../../utils/validators';
import type { TransactionFormData } from '../../../utils/validators';
import { useTransactions } from '../../../hooks/useTransactions';
import { useCategories } from '../../../hooks/useCategories';
import { Modal } from '../../ui/Modal/Modal';
import { Input, Textarea, Select } from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { todayISO } from '../../../utils/formatters';
import styles from './AddTransaction.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: TransactionFormData & { id: string } | null;
}

export function AddTransaction({ open, onClose, editData }: Props) {
  const { t } = useTranslation();
  const { create, update } = useTransactions();
  const { categories } = useCategories();
  const [serverError, setServerError] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>(editData?.type ?? 'expense');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: todayISO(),
      ...editData,
    },
  });

  useEffect(() => {
    setValue('type', txType);
  }, [txType, setValue]);

  useEffect(() => {
    if (!open) { reset({ type: 'expense', date: todayISO() }); setTxType('expense'); }
  }, [open, reset]);

  const filteredCategories = categories
    .filter((c) => c.type === txType)
    .map((c) => ({
      value: c.id,
      label: t(`category.${c.name.toLowerCase()}`, { defaultValue: c.name }),
    }));

  const onSubmit = async (data: TransactionFormData) => {
    setServerError('');
    try {
      if (editData?.id) {
        await update(editData.id, data);
      } else {
        await create(data);
      }
      onClose();
    } catch {
      setServerError(t('transaction.saveFailed'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editData ? t('transaction.edit') : t('dashboard.addTransaction')}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t('transaction.cancel')}</Button>
          <Button form="tx-form" type="submit" loading={isSubmitting}>
            {isSubmitting ? t('transaction.saving') : t('transaction.save')}
          </Button>
        </>
      }
    >
      <form id="tx-form" className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className={styles.errorAlert}>{serverError}</div>}

        {/* Type toggle */}
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={[styles.typeBtn, styles.income, txType === 'income' ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => setTxType('income')}
          >
            <TrendingUp size={14} />
            {t('transaction.income')}
          </button>
          <button
            type="button"
            className={[styles.typeBtn, styles.expense, txType === 'expense' ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => setTxType('expense')}
          >
            <TrendingDown size={14} />
            {t('transaction.expense')}
          </button>
        </div>

        <Input
          label={t('transaction.title')}
          placeholder={txType === 'income' ? t('transaction.placeholderIncome') : t('transaction.placeholderExpense')}
          error={errors.title?.message}
          {...register('title')}
        />

        <div className={styles.row}>
          <Input
            label={t('transaction.amount')}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Input
            label={t('transaction.date')}
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select
              label={t('transaction.category')}
              placeholder={t('transaction.selectCategory')}
              options={filteredCategories}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.category_id?.message}
            />
          )}
        />

        <Textarea
          label={t('transaction.notes')}
          placeholder={t('transaction.optionalNote')}
          rows={2}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
}
