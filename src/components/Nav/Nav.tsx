import { NavLink, useLocation } from 'react-router';

import styles from './Nav.module.css';

interface NavProps {
  variant?: 'desktop' | 'menu';
  onNavigate?: () => void;
}

const links = [
  { to: '/news', label: 'News' },
  { to: '/notices', label: 'Find pet' },
  { to: '/friends', label: 'Our friends' },
];

export default function Nav({
  variant = 'desktop',
  onNavigate,
}: NavProps) {
  const { pathname } = useLocation();

  const isHome = pathname === '/home';

  const navClassName = [
    styles.nav,
    styles[variant],
    isHome && variant === 'desktop' && styles.home,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={navClassName}
      aria-label="Main navigation"
    >
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              styles.link,
              isActive && styles.active,
            ]
              .filter(Boolean)
              .join(' ')
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
