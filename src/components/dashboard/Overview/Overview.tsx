import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../../../store';
import { Button } from '../../ui/Button/Button';
import { formatCurrency } from '../../../utils/formatters';
import styles from './Overview.module.css';

function greetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return 'dashboard.goodMorning';
  if (h < 17) return 'dashboard.goodAfternoon';
  return 'dashboard.goodEvening';
}

const ICON_MAP: Record<string, string> = {
  salary: '💼', food: '🍕', transport: '🚗', housing: '🏠',
  shopping: '🛒', utilities: '💡', income: '💰', other: '📌',
};

export function Overview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, summary, transactions, setAddTransactionOpen } = useAppStore();

  const recent = transactions.slice(0, 5);

  const stats = [
    {
      label: t('dashboard.balance'),
      value: summary?.balance ?? 0,
      change: '+12.5%',
      positive: true,
      icon: <Wallet size={16} />,
      iconBg: 'rgba(0,0,0,0.2)',
      variant: 'balance' as const,
    },
    {
      label: t('dashboard.income'),
      value: summary?.totalIncome ?? 0,
      change: '+8.2%',
      positive: true,
      icon: <TrendingUp size={16} />,
      iconBg: 'var(--color-success-bg)',
      iconColor: 'var(--color-success)',
    },
    {
      label: t('dashboard.expenses'),
      value: summary?.totalExpenses ?? 0,
      change: '-3.1%',
      positive: false,
      icon: <TrendingDown size={16} />,
      iconBg: 'var(--color-error-bg)',
      iconColor: 'var(--color-error)',
    },
    {
      label: t('dashboard.savings'),
      value: null,
      rateValue: summary?.savingsRate ?? 0,
      change: '+2.4%',
      positive: true,
      icon: <PiggyBank size={16} />,
      iconBg: 'var(--color-info-bg)',
      iconColor: 'var(--color-info)',
    },
  ];

  return (
    <div className={styles.overview}>
      <div className={styles.greeting}>
        <h1 className={styles.greetingText}>
          {t(greetingKey())}, {user?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className={styles.greetingDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={[styles.statCard, stat.variant === 'balance' ? styles.balance : ''].filter(Boolean).join(' ')}
          >
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statIcon} style={{ background: stat.iconBg, color: stat.iconColor }}>
                {stat.icon}
              </span>
            </div>
            <div className={styles.statValue}>
              {stat.rateValue !== undefined
                ? `${stat.rateValue.toFixed(1)}%`
                : formatCurrency(stat.value ?? 0)}
            </div>
            <div className={[styles.statChange, stat.positive ? styles.positive : styles.negative].join(' ')}>
              <ArrowUpRight size={12} style={{ transform: stat.positive ? 'none' : 'rotate(90deg)' }} />
              {stat.change} {t('dashboard.vsLastMonth')}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <div className={styles.quickAdd}>
          <p className={styles.sectionTitle}>{t('dashboard.quickActions')}</p>
          <div className={styles.quickBtns}>
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setAddTransactionOpen(true)}
            >
              {t('dashboard.addTransaction')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/transactions')}>
              {t('dashboard.viewAllTransactions')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/budgets')}>
              {t('dashboard.manageBudgets')}
            </Button>
          </div>
        </div>

        <div className={styles.miniList}>
          <div className={styles.miniListHeader}>
            <span className={styles.sectionTitle}>{t('dashboard.recentTransactions')}</span>
            <Link to="/dashboard/transactions" className={styles.viewAll}>
              {t('dashboard.viewAll')}
            </Link>
          </div>

          {recent.length === 0 ? (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '8px 0' }}>
              {t('dashboard.noTransactions')}
            </p>
          ) : (
            recent.map((tx) => (
              <div key={tx.id} className={styles.miniItem}>
                <div className={styles.miniIcon} style={{ background: tx.type === 'income' ? 'var(--color-success-bg)' : 'var(--color-error-bg)' }}>
                  {ICON_MAP[tx.category?.name?.toLowerCase() ?? 'other'] ?? (tx.type === 'income' ? '💰' : '💸')}
                </div>
                <span className={styles.miniName}>{tx.title}</span>
                <span className={[styles.miniAmount, tx.type === 'income' ? styles.incomeAmt : styles.expenseAmt].join(' ')}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
