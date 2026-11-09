import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import axios from 'axios';

import Container from '../Container/Container';
import Icon from '../Icon/Icon';
import Nav from '../Nav/Nav';
import AuthNav from '../AuthNav/AuthNav';
import UserNav from '../UserNav/UserNav';
import MobileMenu from '../MobileMenu/MobileMenu';
import ModalApproveAction from '../ModalApproveAction/ModalApproveAction';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/auth/authSlice';
import { logoutUser } from '../../services/authApi';
import { api } from '../../services/api';

import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector(
    (state) => state.auth.isLoggedIn,
  );

  const isHome = location.pathname === '/home';

  const openLogoutModal = () => {
    setIsMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutUser();
      toast.success('Successfully logged out!');
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Could not end the server session.';

      toast.error(message);
    } finally {
      delete api.defaults.headers.common.Authorization;

      // Remove authentication-related storage.
      localStorage.removeItem('token');

      // Clear the Redux authentication state.
      dispatch(logout());

      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      setIsMenuOpen(false);

      navigate('/home', { replace: true });
    }
  };

  return (
    <>
      <header
        className={`${styles.header} ${
          isHome ? styles.homeHeader : ''
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

            <Nav />

            <div className={styles.headerActions}>
              {isLoggedIn ? (
                <UserNav
                  isHome={isHome}
                  onLogoutClick={openLogoutModal}
                />
              ) : (
                <AuthNav isHome={isHome} />
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
        onLogoutClick={openLogoutModal}
      />

      <ModalApproveAction
        isOpen={isLogoutModalOpen}
        isLoading={isLoggingOut}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          void handleLogout();
        }}
      />
    </>
  );
}
