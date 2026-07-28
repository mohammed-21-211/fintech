import { useTranslation } from 'react-i18next';
import styles from './Features.module.css';

const BAR_HEIGHTS = [40, 65, 50, 80, 60, 90, 70];

function BalanceMockup({ label, delta }: { label: string; delta: string }) {
  return (
    <div className={styles.screen}>
      <div className={styles.screenLabel}>{label}</div>
      <div className={styles.screenValue}>$24,563</div>
      <div className={styles.screenDelta}>↑ 12.5% · {delta}</div>
      <div className={styles.miniChart}>
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className={styles.miniBar} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function TransactionsMockup({ rows }: { rows: { icon: string; name: string; amount: string; kind: 'income' | 'expense' }[] }) {
  return (
    <div className={styles.screen}>
      {rows.map((r) => (
        <div key={r.name} className={styles.txRow}>
          <span className={styles.txIcon}>{r.icon}</span>
          <span className={styles.txName}>{r.name}</span>
          <span className={[styles.txAmount, styles[r.kind]].join(' ')}>{r.amount}</span>
        </div>
      ))}
    </div>
  );
}

function SpendingMockup({ cats }: { cats: { label: string; pct: number }[] }) {
  return (
    <div className={styles.screen}>
      {cats.map((c) => (
        <div key={c.label} className={styles.catRow}>
          <span className={styles.catLabel}>{c.label}</span>
          <span className={styles.catTrack}>
            <span className={styles.catFill} style={{ width: `${c.pct}%` }} />
          </span>
          <span className={styles.catPct}>{c.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  const { t } = useTranslation();

  const cards = [
    {
      bg: 'lime' as const,
      badge: t('features.card1.badge'),
      title: t('features.card1.title'),
      desc: t('features.card1.desc'),
      mockup: <BalanceMockup label={t('dashboard.balance')} delta={t('dashboard.vsLastMonth')} />,
    },
    {
      bg: 'dark' as const,
      badge: t('features.card2.badge'),
      title: t('features.card2.title'),
      desc: t('features.card2.desc'),
      mockup: (
        <TransactionsMockup
          rows={[
            { icon: '💼', name: t('category.salary'), amount: '+$3,200', kind: 'income' },
            { icon: '🛒', name: t('category.shopping'), amount: '−$54.20', kind: 'expense' },
            { icon: '🍔', name: t('category.food'), amount: '−$18.50', kind: 'expense' },
          ]}
        />
      ),
    },
    {
      bg: 'gray' as const,
      badge: t('features.card3.badge'),
      title: t('features.card3.title'),
      desc: t('features.card3.desc'),
      mockup: (
        <SpendingMockup
          cats={[
            { label: t('category.food'), pct: 40 },
            { label: t('category.transport'), pct: 25 },
            { label: t('category.shopping'), pct: 20 },
            { label: t('category.utilities'), pct: 15 },
          ]}
        />
      ),
    },
  ];

  return (
    <section className={styles.section} id="features">
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t('features.eyebrow')}</span>
          <h2 className={styles.title}>{t('features.title')}</h2>
          <p className={styles.subtitle}>{t('features.subtitle')}</p>
        </div>

        <div className={styles.grid}>
          {cards.map((card) => (
            <div key={card.title} className={styles.card}>
              <div className={[styles.cardVisual, styles[card.bg]].join(' ')}>{card.mockup}</div>
              <div className={styles.cardBody}>
                <span className={styles.cardBadge}>{card.badge}</span>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDesc}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
