import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../redux/hooks';

export default function RestrictedRoute() {
  const { isLoggedIn, isRefreshing } = useAppSelector((state) => state.auth);

  if (isRefreshing) {
    return <p>Loading...</p>;
  }

  return isLoggedIn ? <Navigate to="/profile" replace /> : <Outlet />;
}
