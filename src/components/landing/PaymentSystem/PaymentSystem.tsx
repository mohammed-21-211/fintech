import { useTranslation } from 'react-i18next';
import styles from './PaymentSystem.module.css';

const ORBIT_ITEMS = [
  { emoji: '💳', angle: 0 },
  { emoji: '📊', angle: 90 },
  { emoji: '🏦', angle: 180 },
  { emoji: '📱', angle: 270 },
];

export function PaymentSystem() {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.diagram}>
          <div className={styles.ring + ' ' + styles.ring1} />
          <div className={styles.ring + ' ' + styles.ring2} />
          <div className={styles.ring + ' ' + styles.ring3} />

          {ORBIT_ITEMS.map((item) => {
            const rad = (item.angle * Math.PI) / 180;
            const r = 130;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            return (
              <div
                key={item.angle}
                className={styles.orbitDot}
                style={{
                  transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                  marginLeft: 0,
                  marginTop: 0,
                }}
              >
                {item.emoji}
              </div>
            );
          })}

          <div className={styles.center}>₿</div>
        </div>

        <div className={styles.content}>
          <span className={styles.eyebrow}>Payment System</span>
          <h2 className={styles.title}>{t('payment.title')}</h2>
          <p className={styles.desc}>{t('payment.description')}</p>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{t('payment.stat1.value')}</div>
              <div className={styles.statLabel}>{t('payment.stat1.label')}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{t('payment.stat2.value')}</div>
              <div className={styles.statLabel}>{t('payment.stat2.label')}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{t('payment.stat3.value')}</div>
              <div className={styles.statLabel}>{t('payment.stat3.label')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
