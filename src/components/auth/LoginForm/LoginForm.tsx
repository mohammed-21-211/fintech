import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { signInSchema } from '../../../utils/validators';
import type { SignInFormData } from '../../../utils/validators';
import { Input } from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import styles from './LoginForm.module.css';

const MINI_BARS = [30, 55, 45, 70, 40, 65, 50, 75];

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInFormData) => {
    setServerError('');
    try {
      await authService.signIn(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : 'SIGN_IN_FAILED';
      const key =
        code === 'EMAIL_NOT_CONFIRMED' ? 'auth.errorEmailNotConfirmed'
        : code === 'INVALID_CREDENTIALS' ? 'auth.errorInvalidCredentials'
        : 'auth.errorSignInFailed';
      setServerError(t(key));
    }
  };

  return (
    <div className={styles.page}>
      {/* Left: form */}
      <div className={styles.panel}>
        <button className={styles.back} onClick={() => navigate('/')} aria-label="Back to home">
          <ArrowLeft size={16} />
          Back to home
        </button>

        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>F</span>
          Fintech
        </Link>

        <div className={styles.heading}>
          <h1 className={styles.title}>{t('auth.login')}</h1>
          <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        {serverError && <div className={styles.errorAlert}>{serverError}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label={t('auth.email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label={t('auth.password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock size={16} />}
              rightIcon={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightIconClick={() => setShowPw((v) => !v)}
              error={errors.password?.message}
              {...register('password')}
            />
            <a className={styles.forgotLink}>{t('auth.forgotPassword')}</a>
          </div>

          <Button type="submit" full size="lg" loading={isSubmitting}>
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        <p className={styles.footer}>
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className={styles.footerLink}>{t('auth.signUp')}</Link>
        </p>
      </div>

      {/* Right: visual */}
      <div className={styles.visual}>
        <div className={styles.visualCard}>
          <div className={styles.visualCardHeader}>
            <span className={styles.visualCardTitle}>Financial Overview</span>
            <span style={{ fontSize: '1rem' }}>📊</span>
          </div>
          <div className={styles.visualBalance}>
            <div className={styles.visualBalanceLabel}>Total Balance</div>
            <div className={styles.visualBalanceValue}>$24,563</div>
            <div className={styles.visualChange}>↑ +12.5% this month</div>
          </div>
          <div className={styles.miniChart}>
            {MINI_BARS.map((h, i) => (
              <div
                key={i}
                className={[styles.miniChartBar, i === 7 ? styles.active : ''].join(' ')}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className={styles.visualQuote}>
          <p className={styles.visualQuoteText}>"Take control of your finances."</p>
          <p className={styles.visualQuoteAuthor}>Fintech Platform</p>
        </div>
      </div>
    </div>
  );
}
