import { forwardRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, onRightIconClick, className, id, ...rest }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 7)}`;
    const inputClass = [
      styles.input,
      error ? styles.error : '',
      leftIcon ? styles.withLeftIcon : '',
      rightIcon ? styles.withRightIcon : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input ref={ref} id={inputId} className={inputClass} {...rest} />
          {rightIcon && (
            <span
              className={styles.rightIcon}
              onClick={onRightIconClick}
              role={onRightIconClick ? 'button' : undefined}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className={styles.errorMsg}>{error}</span>}
        {!error && hint && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          className={[styles.input, styles.textarea, error ? styles.error : '', className ?? ''].filter(Boolean).join(' ')}
          {...rest}
        />
        {error && <span className={styles.errorMsg}>{error}</span>}
        {!error && hint && <span className={styles.hint}>{hint}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function Select({ label, error, hint, options, value, onChange, placeholder, id }: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <select
          id={selectId}
          className={[styles.input, styles.select, error ? styles.error : ''].filter(Boolean).join(' ')}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className={styles.selectArrow}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
