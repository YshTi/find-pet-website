import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab') {
        const buttons = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href]',
        );

        if (!buttons?.length) return;

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="attention-title"
        aria-describedby="attention-description"
        className={styles.modal}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <Icon name="icon-cross" className={styles.closeIcon} />
        </button>

        <div className={styles.avatar}>
          <img
            src="/images/dog-icon.webp"
            alt=""
            className={styles.avatarImage}
          />
        </div>

        <h2 id="attention-title" className={styles.title}>
          Attention
        </h2>

        <p id="attention-description" className={styles.description}>
          We would like to remind you that certain functionality is available
          only to authorized users. If you have an account, please log in with
          your credentials. If you do not already have an account, you must
          register to access these features.
        </p>

        <div className={styles.actions}>
          <Link to="/login" onClick={onClose} className={styles.loginButton}>
            Log In
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className={styles.registerButton}
          >
            Registration
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
