import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

type ButtonProps = ButtonBaseProps &
  (
    | ({ as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>)
    | ({ as: 'a' } & AnchorHTMLAttributes<HTMLAnchorElement>)
  );

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      full = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      as: Tag = 'button',
      ...rest
    },
    ref
  ) => {
    const classes = [
      styles.btn,
      styles[variant],
      styles[size],
      full ? styles.full : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {loading && <span className={styles.spinner} aria-hidden />}
        {!loading && leftIcon}
        {children}
        {rightIcon}
      </>
    );

    if (Tag === 'a') {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
