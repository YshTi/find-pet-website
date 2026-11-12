import Button from '../Button/Button';
import UserBar from '../UserBar/UserBar';

import styles from './UserNav.module.css';

interface UserNavProps {
  variant?: 'header' | 'menu';
  isHome?: boolean;
  onLogoutClick: () => void;
  onNavigate?: () => void;
}

export default function UserNav({
  variant = 'header',
  isHome = false,
  onLogoutClick,
  onNavigate,
}: UserNavProps) {
  return (
    <div
      className={`${styles.userNav} ${styles[variant]} ${
        isHome ? styles.home : ''
      }`}
    >
      <Button
        type="button"
        variant="primary"
        className={styles.logoutButton}
        onClick={onLogoutClick}
      >
        LOG OUT
      </Button>

      {variant === 'header' && (
        <UserBar isHome={isHome} onNavigate={onNavigate} />
      )}
    </div>
  );
}
