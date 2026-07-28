import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  );
}

export function PageSpinner() {
  return (
    <div className={styles.page}>
      <Spinner size={40} />
    </div>
  );
}
