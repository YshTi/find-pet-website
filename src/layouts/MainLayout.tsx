import { Outlet, useLocation } from 'react-router';

import Header from '../components/Header/Header';

export default function MainLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/home';

  return (
    <div
      className={isHome ? 'homeLayout' : undefined}
    >
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
