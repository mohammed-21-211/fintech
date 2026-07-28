import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../store';
import styles from './Newsletter.module.css';

export function Newsletter() {
  const { t } = useTranslation();
  const { addToast } = useAppStore();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      addToast({ type: 'error', title: 'Please enter a valid email address.' });
      return;
    }
    addToast({ type: 'success', title: 'Subscribed!', message: 'You\'ll hear from us soon.' });
    setEmail('');
  };

  return (
    <div className={styles.section}>
      <div className={styles.inner}>
        <span className={styles.title}>{t('newsletter.title')}</span>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder={t('newsletter.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label={t('newsletter.placeholder')}
          />
          <button type="submit" className={styles.btn}>{t('newsletter.subscribe')}</button>
        </form>
      </div>
    </div>
  );
}
