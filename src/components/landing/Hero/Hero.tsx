import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import styles from './Hero.module.css';

const AVATARS = ['AJ', 'SM', 'KL', 'PO', 'RM'];
const AVATAR_COLORS = ['#D4F03C20', '#60A5FA20', '#A78BFA20', '#F8717120', '#4ADE8020'];

export function Hero({ onLearnMore }: { onLearnMore?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {/* Left: copy */}
        <div className={styles.content}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            #1 Financial Management Platform
          </span>

          <h1 className={styles.heading}>
            Maximize Your<br />
            <span className={styles.accent}>Money Flow.</span>
          </h1>

          <p className={styles.subtitle}>{t('hero.subtitle')}</p>

          <div className={styles.actions}>
            <Button size="lg" onClick={() => navigate('/signup')} rightIcon={<ArrowRight size={18} />}>
              {t('hero.cta')}
            </Button>
            <Button variant="ghost" size="lg" leftIcon={<Play size={16} />} onClick={onLearnMore}>
              {t('hero.learnMore')}
            </Button>
          </div>

          <div className={styles.trust}>
            <div className={styles.avatars}>
              {AVATARS.map((a, i) => (
                <div
                  key={a}
                  className={styles.avatar}
                  style={{ background: AVATAR_COLORS[i] }}
                >
                  {a}
                </div>
              ))}
            </div>
            <p className={styles.trustText}>
              <strong>50,000+</strong> users worldwide
            </p>
          </div>
        </div>

        {/* Right: visual */}
        <div className={styles.visual}>
          <div className={styles.bgCircle} />

          <div className={styles.cardMockup}>
            <div className={styles.cardChip} />
            <div className={styles.cardNumber}>•••• •••• •••• 4242</div>
            <div className={styles.cardFooter}>
              <span className={styles.cardHolder}>John Doe</span>
              <div className={styles.cardBrand}>
                <span />
                <span />
              </div>
            </div>
          </div>

          <div className={styles.floatCard}>
            <div className={styles.floatLabel}>Total Balance</div>
            <div className={styles.floatValue}>$24,563</div>
            <div className={styles.floatChange}>↑ 12.5% this month</div>
          </div>

          <div className={styles.floatCard}>
            <div className={styles.floatLabel}>Monthly Savings</div>
            <div className={styles.floatValue}>$3,240</div>
            <div className={styles.floatChange}>↑ 8.2%</div>
          </div>

          <div className={styles.floatCard}>
            <div className={styles.floatLabel}>Expenses</div>
            <div className={styles.floatValue}>$1,840</div>
            <div className={styles.floatChange} style={{ color: 'var(--color-error)' }}>
              ↓ 3.1%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
