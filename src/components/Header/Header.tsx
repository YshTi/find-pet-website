import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';

import Container from '../Container/Container';
import Icon from '../Icon/Icon';
import MobileMenu from '../MobileMenu/MobileMenu';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/auth/authSlice';

import styles from './Header.module.css';

const navigation = [
  { label: 'News', to: '/news' },
  { label: 'Find pet', to: '/notices' },
  { label: 'Our friends', to: '/friends' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useAppSelector(
    (state) => state.auth.isLoggedIn,
  );

  const user = useAppSelector((state) => state.auth.user);

  const isHomePage = location.pathname === '/home';

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate('/home');
  };

  return (
    <>
      <header
        className={`${styles.header} ${
          isHomePage ? styles.homeHeader : ''
        }`}
      >
        <Container>
          <div className={styles.headerInner}>
            <Link
              to="/home"
              className={styles.logo}
              aria-label="PetLove home"
              onClick={() => setIsMenuOpen(false)}
            >
              petl
              <Icon
                name="icon-heart-filled"
                className={styles.logoHeart}
              />
              ve
            </Link>

            <nav
              className={styles.desktopNav}
              aria-label="Main navigation"
            >
              {navigation.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${
                      isActive ? styles.activeLink : ''
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.headerActions}>
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={handleLogout}
                  >
                    LOG OUT
                  </button>

                  <Link
                    to="/profile"
                    className={styles.userLink}
                    aria-label="My profile"
                  >
                    <span className={styles.avatar}>
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className={styles.avatarImage}
                        />
                      ) : (
                        <Icon
                          name="icon-user"
                          className={styles.userIcon}
                        />
                      )}
                    </span>

                    <span className={styles.userName}>
                      {user?.name || 'User'}
                    </span>
                  </Link>
                </>
              ) : (
                <div className={styles.authButtons}>
                  <Link
                    to="/login"
                    className={styles.loginButton}
                  >
                    LOG IN
                  </Link>

                  <Link
                    to="/register"
                    className={styles.registerButton}
                  >
                    REGISTRATION
                  </Link>
                </div>
              )}

              <button
                type="button"
                className={styles.menuButton}
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                <Icon
                  name="icon-menu-01"
                  className={styles.menuIcon}
                />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        userName={user?.name}
        onLogout={handleLogout}
      />
    </>
  );
}
