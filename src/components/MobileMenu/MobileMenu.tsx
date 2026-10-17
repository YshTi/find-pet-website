import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router';

import Icon from '../Icon/Icon';
import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
}

const navigation = [
  { label: 'News', to: '/news' },
  { label: 'Find pet', to: '/notices' },
  { label: 'Our friends', to: '/friends' },
];

export default function MobileMenu({
  isOpen,
  onClose,
  isLoggedIn,
  userName,
  onLogout,
}: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
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
          <Icon
            name="icon-cross"
            className={styles.closeIcon}
          />
        </button>

        <nav
          className={styles.navigation}
          aria-label="Mobile navigation"
        >
          {navigation.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${
                  isActive ? styles.activeLink : ''
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {isLoggedIn && (
            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${
                  isActive ? styles.activeLink : ''
                }`
              }
            >
              My profile
            </NavLink>
          )}
        </nav>

        <div className={styles.authActions}>
          {isLoggedIn ? (
            <>
              <button
                type="button"
                className={styles.logoutButton}
                onClick={onLogout}
              >
                LOG OUT
              </button>

              {userName && (
                <span className={styles.userName}>
                  {userName}
                </span>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={styles.loginButton}
                onClick={onClose}
              >
                LOG IN
              </Link>

              <Link
                to="/register"
                className={styles.registerButton}
                onClick={onClose}
              >
                REGISTRATION
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
