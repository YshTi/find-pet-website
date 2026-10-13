import { Link, NavLink } from 'react-router';
import { useAppSelector } from '../../redux/hooks';

import styles from './Header.module.css';

export default function Header() {
  const isLoggedIn = useAppSelector(
    (state) => state.auth.isLoggedIn,
  );

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/home" className={styles.logo}>
          PetLove
        </Link>

        <nav aria-label="Main navigation">
          <NavLink to="/news">News</NavLink>
          <NavLink to="/notices">Find pet</NavLink>
          <NavLink to="/friends">Our friends</NavLink>
        </nav>

        <div className={styles.auth}>
          {isLoggedIn ? (
            <NavLink to="/profile">Profile</NavLink>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Registration</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
