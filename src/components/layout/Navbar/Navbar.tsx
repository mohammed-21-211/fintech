import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import { setLanguage } from '../../../i18n';
import { useAppStore } from '../../../store';
import styles from './Navbar.module.css';

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, language, setLanguage: storeLang } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => {
    const next = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
    storeLang(next);
  };

  const navLinks = [
    { label: t('nav.solutions'),   href: '#features' },
    { label: t('nav.features'),    href: '#features' },
    { label: t('nav.developers'),  href: '#' },
  ];

  return (
    <>
      <header className={[styles.navbar, scrolled ? styles.scrolled : ''].join(' ')}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>F</span>
            Fintech
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <button className={styles.langToggle} onClick={toggleLang} aria-label="Toggle language">
              <Globe size={13} />
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            {user ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t('nav.login')}
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  {t('nav.getStarted')}
                </Button>
              </>
            )}
          </div>

          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.navLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className={styles.mobileActions}>
            <button
              className={styles.langToggle}
              onClick={() => { toggleLang(); setMenuOpen(false); }}
              aria-label="Toggle language"
            >
              <Globe size={14} />
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <Button variant="ghost" full onClick={() => { navigate('/login'); setMenuOpen(false); }}>
              {t('nav.login')}
            </Button>
            <Button full onClick={() => { navigate('/signup'); setMenuOpen(false); }}>
              {t('nav.getStarted')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
