import Button from '../Button/Button';
import styles from './AuthNav.module.css';

interface AuthNavProps {
  variant?: 'header' | 'menu';
  isHome?: boolean;
  onNavigate?: () => void;
}

export default function AuthNav({
  variant = 'header',
  isHome = false,
  onNavigate,
}: AuthNavProps) {
  return (
    <div
      className={`${styles.authNav} ${styles[variant]} ${
        isHome ? styles.home : ''
      }`}
      onClick={onNavigate}
    >
      <Button to="/login" variant="primary" className={styles.login}>
        LOG IN
      </Button>

      <Button to="/register" variant="secondary" className={styles.register}>
        REGISTRATION
      </Button>
    </div>
  );
}
