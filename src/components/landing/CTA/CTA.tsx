import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import styles from './CTA.module.css';

export function CTA({ onLearnMore }: { onLearnMore?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.tag}>✦ Get Started Today</span>
          <h2 className={styles.title}>{t('cta.title')}</h2>
          <p className={styles.subtitle}>{t('cta.subtitle')}</p>

          <div className={styles.actions}>
            <Button size="lg" onClick={() => navigate('/signup')} rightIcon={<ArrowRight size={18} />}>
              {t('hero.cta')}
            </Button>
            <Button variant="secondary" size="lg" leftIcon={<Play size={16} />} onClick={onLearnMore}>
              {t('cta.learnMore')}
            </Button>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.abstract}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />
            <div className={styles.blob3} />
          </div>

          <div className={styles.floatStat}>
            <div className={styles.floatStatLabel}>Users Onboarded</div>
            <div className={styles.floatStatValue}>50K+</div>
          </div>

          <div className={styles.floatStat}>
            <div className={styles.floatStatLabel}>Money Tracked</div>
            <div className={styles.floatStatValue}>$2.4B</div>
          </div>
        </div>
      </div>
    </section>
  );
}
