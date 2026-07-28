import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'lime';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'default', dot = false, className }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
