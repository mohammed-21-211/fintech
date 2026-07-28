import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../../../store';
import { formatCurrency, formatMonthYear } from '../../../utils/formatters';
import styles from './Analytics.module.css';

const CAT_COLORS = [
  '#D4F03C', '#4ADE80', '#60A5FA', '#FB923C',
  '#A78BFA', '#EC4899', '#FACC15', '#F87171',
];

export function Analytics() {
  const { t } = useTranslation();
  const { monthlyData, transactions } = useAppStore();

  const chartData = monthlyData.map((d) => ({
    ...d,
    month: formatMonthYear(d.month),
  }));

  const categoryTotals = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce<Record<string, { amount: number; key: string }>>((acc, tx) => {
      const key = tx.category?.name ?? 'Other';
      if (!acc[key]) acc[key] = { amount: 0, key };
      acc[key].amount += tx.amount;
      return acc;
    }, {});

  const catEntries = Object.entries(categoryTotals)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 8)
    .map(([key, { amount }]) => ({
      name: t(`category.${key.toLowerCase()}`, { defaultValue: key }),
      amount,
    }));

  const maxCat = catEntries[0]?.amount ?? 1;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('analytics.title')}</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span>{t('analytics.incomeVsExpenses')}</span>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--color-lime)' }} />
                {t('analytics.income')}
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--color-error)' }} />
                {t('analytics.expenses')}
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className={styles.emptyState}>{t('analytics.noData')}</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-lime)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-lime)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Area type="monotone" dataKey="income" stroke="var(--color-lime)" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" stroke="var(--color-error)" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t('analytics.spendingByCategory')}</div>

          {catEntries.length === 0 ? (
            <div className={styles.emptyState}>{t('analytics.noExpenseData')}</div>
          ) : (
            <div className={styles.categoryList}>
              {catEntries.map(({ name, amount }, i) => (
                <div key={name} className={styles.catRow}>
                  <div className={styles.catHeader}>
                    <span className={styles.catName}>
                      <span className={styles.catDot} style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                      {name}
                    </span>
                    <span className={styles.catAmount}>{formatCurrency(amount)}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(amount / maxCat) * 100}%`,
                        background: CAT_COLORS[i % CAT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
