import { useEffect, useRef } from 'react';

import Icon from '../Icon/Icon';
import Nav from '../Nav/Nav';
import AuthNav from '../AuthNav/AuthNav';
import UserNav from '../UserNav/UserNav';

import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogoutClick: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  isLoggedIn,
  onLogoutClick,
}: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      if (event.key === 'Tab') {
        const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      <aside
        ref={menuRef}
        id="mobile-navigation"
        className={styles.menu}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <Icon name="icon-cross" className={styles.closeIcon} />
        </button>

        <div className={styles.navigation}>
          <Nav variant="menu" onNavigate={onClose} />
        </div>

        <div className={styles.actions}>
          {isLoggedIn ? (
            <UserNav variant="menu" onLogoutClick={onLogoutClick} />
          ) : (
            <AuthNav variant="menu" onNavigate={onClose} />
          )}
        </div>
      </aside>
    </div>
  );
}
