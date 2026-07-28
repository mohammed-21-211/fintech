import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
  padding?: string;
}

export function Card({ children, hoverable = false, className, padding, style, ...rest }: CardProps) {
  return (
    <div
      className={[styles.card, hoverable ? styles.hoverable : '', className].filter(Boolean).join(' ')}
      style={padding ? { ...style, padding } : style}
      {...rest}
    >
      {children}
    </div>
  );
}
