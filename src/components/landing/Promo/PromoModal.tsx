import { useEffect } from 'react';
import { X } from 'lucide-react';
import { PromoStage } from './engine';
import { FintechPromo } from './PromoScenes';
import styles from './PromoModal.module.css';

interface PromoModalProps {
  open: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export function PromoModal({ open, onClose, lang }: PromoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal
      aria-label="Fintech promo"
    >
      <div className={styles.frame}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className={styles.stage}>
          <PromoStage width={1080} height={1080} duration={30} background="#0A0A0A">
            <FintechPromo lang={lang} />
          </PromoStage>
        </div>
      </div>
    </div>
  );
}
