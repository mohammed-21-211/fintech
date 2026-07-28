import { useTranslation } from 'react-i18next';
import styles from './Insights.module.css';

const BARS = [
  { height: 40, color: 'var(--color-lime)' },
  { height: 65, color: 'var(--color-lime)' },
  { height: 50, color: 'var(--color-lime)' },
  { height: 80, color: 'var(--color-lime)' },
  { height: 55, color: 'var(--color-border-light)' },
  { height: 70, color: 'var(--color-border-light)' },
];

const CHECKS = [
  'Real-time transaction tracking',
  'AI-powered spending insights',
  'Custom budget alerts',
  'Monthly financial reports',
];

const DOT_COLORS = ['#F87171', '#FACC15', '#4ADE80'];

export function Insights() {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}>{t('insights.badge')}</span>
          <h2 className={styles.title}>{t('insights.title')}</h2>
          <p className={styles.desc}>{t('insights.description')}</p>

          <div className={styles.checkList}>
            {CHECKS.map((item) => (
              <div key={item} className={styles.checkItem}>
                <span className={styles.check}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dashMockup}>
          <div className={styles.mockupHeader}>
            <span className={styles.mockupTitle}>Financial Overview</span>
            <div className={styles.mockupDots}>
              {DOT_COLORS.map((c) => (
                <div key={c} className={styles.mockupDot} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className={styles.mockupStats}>
            <div className={styles.mockupStat}>
              <div className={styles.mockupStatLabel}>Balance</div>
              <div className={styles.mockupStatValue}>$24,563</div>
            </div>
            <div className={styles.mockupStat}>
              <div className={styles.mockupStatLabel}>This Month</div>
              <div className={styles.mockupStatValue} style={{ color: 'var(--color-success)' }}>
                +$3,240
              </div>
            </div>
          </div>

          <div className={styles.mockupChart}>
            <div className={styles.chartLabel}>Monthly Cashflow</div>
            <div className={styles.chartBars}>
              {BARS.map((bar, i) => (
                <div
                  key={i}
                  className={styles.chartBar}
                  style={{ height: `${bar.height}%`, background: bar.color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
