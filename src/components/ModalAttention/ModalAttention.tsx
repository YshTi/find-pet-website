import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import Button from '../Button/Button';
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
  const titleId = useId();
  const descriptionId = useId();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }

      if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href]',
        );

        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

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
  }, [isOpen]);

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
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
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

        <h2 id={titleId} className={styles.title}>
          Attention
        </h2>

        <p id={descriptionId} className={styles.description}>
          We would like to remind you that certain functionality is available
          only to authorized users. If you have an account, please log in with
          your credentials. If you do not already have an account, you must
          register to access these features.
        </p>

        <div className={styles.actions}>
          <Button to="/login" variant="primary" className={styles.loginButton}>
            Log In
          </Button>

          <Button
            to="/register"
            variant="secondary"
            className={styles.registerButton}
          >
            Registration
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
