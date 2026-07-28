import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAppStore } from '../../../store';
import { AddTransaction } from '../AddTransaction/AddTransaction';
import { Button } from '../../ui/Button/Button';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { Transaction, TransactionType } from '../../../types';
import type { TransactionFormData } from '../../../utils/validators';
import styles from './TransactionList.module.css';

const ICON_MAP: Record<string, string> = {
  salary: '💼', food: '🍕', transport: '🚗', housing: '🏠',
  shopping: '🛒', utilities: '💡', entertainment: '🎭',
  health: '❤️', education: '📚', travel: '✈️',
  freelance: '💻', investment: '📈', other: '📌',
};

export function TransactionList() {
  const { t } = useTranslation();
  const { transactions, remove } = useTransactions();
  const { addTransactionOpen, setAddTransactionOpen } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [editData, setEditData] = useState<(TransactionFormData & { id: string }) | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = transactions.filter((tx) => {
    const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    return matchSearch && matchType;
  });

  const openEdit = (tx: Transaction) => {
    setEditData({
      id: tx.id,
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category_id: tx.category_id,
      date: tx.date,
      notes: tx.notes,
    });
    setAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('transaction.confirmDelete'))) {
      await remove(id);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('dashboard.transactions')}</h1>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder={t('common.search') + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              className={[styles.filterBtn, typeFilter === f ? styles.active : ''].join(' ')}
              onClick={() => setTypeFilter(f)}
            >
              {t(`transaction.${f}`)}
            </button>
          ))}

          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => { setEditData(null); setAddOpen(true); }}
          >
            {t('dashboard.addTransaction')}
          </Button>
        </div>
      </div>

      <div className={styles.table}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <span className={styles.emptyTitle}>{t('dashboard.noTransactions')}</span>
            <span className={styles.emptyDesc}>{t('dashboard.noTransactionsHint')}</span>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
              {t('dashboard.addTransaction')}
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.tableHead}>
              <span className={styles.th}>{t('transaction.title')}</span>
              <span className={styles.th}>{t('transaction.category')}</span>
              <span className={styles.th}>{t('transaction.date')}</span>
              <span className={styles.th}>{t('transaction.amount')}</span>
              <span className={styles.th} />
            </div>

            {filtered.map((tx) => (
              <div key={tx.id} className={styles.row}>
                <div className={styles.cell}>
                  <div
                    className={styles.txIcon}
                    style={{ background: tx.type === 'income' ? 'var(--color-success-bg)' : 'var(--color-error-bg)' }}
                  >
                    {ICON_MAP[tx.category?.name?.toLowerCase() ?? 'other'] ?? '📌'}
                  </div>
                  <div>
                    <div className={styles.txTitle}>{tx.title}</div>
                    <div className={styles.txSub}>{tx.type === 'income' ? t('transaction.income') : t('transaction.expense')}</div>
                  </div>
                </div>

                <div>
                  <span className={styles.catBadge}>
                    {tx.category?.name
                      ? t(`category.${tx.category.name.toLowerCase()}`, { defaultValue: tx.category.name })
                      : t('transaction.uncategorized')}
                  </span>
                </div>

                <span className={styles.date}>{formatDate(tx.date)}</span>

                <span className={[styles.amount, tx.type === 'income' ? styles.income : styles.expense].join(' ')}>
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>

                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => openEdit(tx)} aria-label={t('transaction.edit')}>
                    <Pencil size={14} />
                  </button>
                  <button
                    className={[styles.actionBtn, styles.deleteBtn].join(' ')}
                    onClick={() => handleDelete(tx.id)}
                    aria-label={t('transaction.delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <AddTransaction
        open={addOpen || addTransactionOpen}
        onClose={() => { setAddOpen(false); setAddTransactionOpen(false); setEditData(null); }}
        editData={editData}
      />
    </div>
  );
}
