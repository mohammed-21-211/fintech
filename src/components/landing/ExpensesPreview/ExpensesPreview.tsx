import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button/Button';
import styles from './ExpensesPreview.module.css';

const ROWS = [
  { icon: '🍕', name: 'Food & Dining', category: 'Food', date: 'May 10, 2025', amount: -52.40, status: 'completed' },
  { icon: '💼', name: 'Salary Deposit',   category: 'Income',   date: 'May 09, 2025', amount: 4200.00, status: 'completed' },
  { icon: '🚗', name: 'Uber Ride',        category: 'Transport',date: 'May 09, 2025', amount: -18.60, status: 'completed' },
  { icon: '🛒', name: 'Amazon Order',     category: 'Shopping', date: 'May 08, 2025', amount: -134.99, status: 'pending' },
  { icon: '💡', name: 'Electric Bill',    category: 'Utilities',date: 'May 07, 2025', amount: -89.00, status: 'completed' },
  { icon: '📊', name: 'Investment Return',category: 'Income',   date: 'May 06, 2025', amount: 320.00, status: 'completed' },
];

const ICON_BG: Record<string, string> = {
  '🍕': '#FB923C20',
  '💼': '#4ADE8020',
  '🚗': '#FACC1520',
  '🛒': '#F472B620',
  '💡': '#38BDF820',
  '📊': '#A78BFA20',
};

export function ExpensesPreview() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            We've created a full{' '}
            <span className={styles.accent}>expense management</span>{' '}
            suite for you
          </h2>
          <p className={styles.desc}>
            From quick transaction entry to detailed reports — everything your finances need.
          </p>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span className={styles.tableHeadCell}>Transaction</span>
            <span className={styles.tableHeadCell}>Category</span>
            <span className={styles.tableHeadCell}>Date</span>
            <span className={styles.tableHeadCell}>Amount</span>
          </div>

          {ROWS.map((row) => (
            <div key={row.name + row.date} className={styles.tableRow}>
              <div className={styles.rowName}>
                <div className={styles.rowIcon} style={{ background: ICON_BG[row.icon] }}>
                  {row.icon}
                </div>
                {row.name}
              </div>
              <span className={styles.rowCategory}>{row.category}</span>
              <span className={styles.rowDate}>{row.date}</span>
              <span className={[styles.rowAmount, row.amount > 0 ? styles.income : styles.expense].join(' ')}>
                {row.amount > 0 ? '+' : ''}
                ${Math.abs(row.amount).toFixed(2)}
              </span>
            </div>
          ))}

          <div className={styles.footer}>
            <Button variant="outline" onClick={() => navigate('/signup')}>
              View All Transactions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
