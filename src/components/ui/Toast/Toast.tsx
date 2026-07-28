import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAppStore } from '../../../store';
import type { ToastType } from '../../../types';
import styles from './Toast.module.css';

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div className={[styles.toast, styles[toast.type]].join(' ')} role="alert">
      <span className={styles.icon}>{ICONS[toast.type]}</span>
      <div className={styles.body}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button className={styles.close} onClick={() => removeToast(toast.id)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useAppStore();
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
