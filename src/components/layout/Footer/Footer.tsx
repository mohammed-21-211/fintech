import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

const COLUMNS = [
  {
    titleKey: 'footer.solutions',
    links: ['Personal Finance', 'Business Finance', 'Investments', 'Payments'],
  },
  {
    titleKey: 'footer.company',
    links: ['About Us', 'Careers', 'Blog', 'Press'],
  },
  {
    titleKey: 'footer.resources',
    links: ['Documentation', 'API Reference', 'Help Center', 'Community'],
  },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoMark}>F</span>
              Fintech
            </Link>
            <p className={styles.brandDesc}>{t('footer.description')}</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <p className={styles.colTitle}>{t(col.titleKey)}</p>
              <div className={styles.colLinks}>
                {col.links.map((l) => (
                  <a key={l} href="#" className={styles.colLink}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>{t('footer.copyright')}</span>
          <div className={styles.bottomLinks}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" className={styles.bottomLink}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
