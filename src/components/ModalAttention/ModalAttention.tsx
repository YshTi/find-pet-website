import { useEffect } from 'react';
import { Link } from 'react-router';

import Icon from '../Icon/Icon';

import styles from './ModalAttention.module.css';

interface ModalAttentionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalAttention({
  isOpen,
  onClose,
}: ModalAttentionProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attention-title"
        className={styles.modal}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <Icon name="icon-cross" />
        </button>

        <h2 id="attention-title">
          Attention
        </h2>

        <p>
          To use this functionality, you need to
          authorize first.
        </p>

        <div className={styles.actions}>
          <Link to="/register" onClick={onClose}>
            Register
          </Link>

          <Link to="/login" onClick={onClose}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
