import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { signUpSchema } from '../../../utils/validators';
import type { SignUpFormData } from '../../../utils/validators';
import { Input } from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import styles from './SignupForm.module.css';

const BENEFITS = [
  { icon: '💰', title: 'Track Every Penny', desc: 'Log income & expenses in 2 taps' },
  { icon: '📊', title: 'Smart Analytics', desc: 'AI-powered financial insights' },
  { icon: '🎯', title: 'Budget Goals', desc: 'Set and hit your savings targets' },
  { icon: '🔒', title: 'Bank-Level Security', desc: 'Your data is always protected' },
];

export function SignupForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpFormData) => {
    setServerError('');
    setConfirmEmail('');
    try {
      const res = await authService.signUp({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      });
      if (res.needsConfirmation) {
        setConfirmEmail(data.email);
        return;
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <button className={styles.back} onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Back to home
        </button>

        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>F</span>
          Fintech
        </Link>

        <div className={styles.heading}>
          <h1 className={styles.title}>{t('auth.signup')}</h1>
          <p className={styles.subtitle}>{t('auth.signupSubtitle')}</p>
        </div>

        {serverError && <div className={styles.errorAlert}>{serverError}</div>}
        {confirmEmail && (
          <div className={styles.errorAlert} style={{ background: 'rgba(212, 240, 60, 0.08)', borderColor: 'var(--color-lime)', color: 'var(--color-text-primary)' }}>
            {t('auth.checkEmailToConfirm', { email: confirmEmail })}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label={t('auth.fullName')}
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            leftIcon={<User size={16} />}
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label={t('auth.email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label={t('auth.password')}
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
            rightIcon={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowPw((v) => !v)}
            error={errors.password?.message}
            hint="Must include uppercase and a number"
            {...register('password')}
          />

          <Input
            label={t('auth.confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat password"
            autoComplete="new-password"
            leftIcon={<Lock size={16} />}
            rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowConfirm((v) => !v)}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <label className={styles.terms}>
            <input type="checkbox" required />
            <span>
              {t('auth.agreeTerms')}{' '}
              <a className={styles.termsLink}>Terms of Service</a>
              {' & '}
              <a className={styles.termsLink}>Privacy Policy</a>
            </span>
          </label>

          <Button type="submit" full size="lg" loading={isSubmitting}>
            {isSubmitting ? t('auth.signingUp') : t('auth.signUp')}
          </Button>
        </form>

        <p className={styles.footer}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className={styles.footerLink}>{t('auth.signIn')}</Link>
        </p>
      </div>

      <div className={styles.visual}>
        <div className={styles.benefitList}>
          {BENEFITS.map((b) => (
            <div key={b.title} className={styles.benefit}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <div className={styles.benefitText}>
                <div className={styles.benefitTitle}>{b.title}</div>
                <div className={styles.benefitDesc}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
