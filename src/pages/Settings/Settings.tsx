import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/auth.service';
import { setLanguage } from '../../i18n';
import { useAppStore } from '../../store';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import styles from './Settings.module.css';

const LANGS = [
  { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية' },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const { user, setUser, language, setLanguage: storeLang, addToast } = useAppStore();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
    },
  });

  const onSave = async (data: { full_name: string; email: string }) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await authService.updateProfile(user.id, { full_name: data.full_name });
      setUser(updated);
      addToast({ type: 'success', title: t('settings.profileUpdated') });
    } catch {
      addToast({ type: 'error', title: t('settings.profileUpdateFailed') });
    } finally {
      setSaving(false);
    }
  };

  const selectLang = (code: string) => {
    const lang = code as 'en' | 'ar';
    setLanguage(lang);
    storeLang(lang);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('settings.title')}</h1>

      {/* Profile */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('settings.profile')}</h2>
        </div>
        <form className={styles.sectionBody} onSubmit={handleSubmit(onSave)}>
          <div className={styles.row}>
            <Input label={t('settings.fullName')} {...register('full_name')} />
            <Input label={t('settings.email')} type="email" disabled {...register('email')} />
          </div>
          <div className={styles.actions}>
            <Button type="submit" loading={saving} disabled={!isDirty}>
              {saving ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </form>
      </div>

      {/* Language */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('settings.language')}</h2>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.langGrid}>
            {LANGS.map((l) => (
              <div
                key={l.code}
                className={[styles.langOption, language === l.code ? styles.selected : ''].join(' ')}
                onClick={() => selectLang(l.code)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && selectLang(l.code)}
              >
                <span className={styles.langFlag}>{l.flag}</span>
                <div className={styles.langText}>
                  <div className={styles.langName}>{l.name}</div>
                  <div className={styles.langNative}>{l.native}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
