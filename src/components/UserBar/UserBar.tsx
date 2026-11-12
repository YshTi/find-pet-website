import { Link } from 'react-router';

import { useAppSelector } from '../../redux/hooks';
import Icon from '../Icon/Icon';

import styles from './UserBar.module.css';

interface UserBarProps {
  isHome?: boolean;
  onNavigate?: () => void;
}

export default function UserBar({ isHome = false, onNavigate }: UserBarProps) {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Link
      to="/profile"
      onClick={onNavigate}
      className={`${styles.userBar} ${isHome ? styles.home : ''}`}
      aria-label="My profile"
    >
      <span className={styles.avatar}>
        {user?.avatar ? (
          <img src={user.avatar} alt="" className={styles.avatarImage} />
        ) : (
          <Icon name="icon-user" className={styles.userIcon} />
        )}
      </span>

      <span className={styles.userName}>{user?.name || 'User'}</span>
    </Link>
  );
}
