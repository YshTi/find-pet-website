import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../redux/hooks';

export default function PrivateRoute() {
  const { isLoggedIn, isRefreshing } = useAppSelector((state) => state.auth);

  if (isRefreshing) {
    return <p>Loading...</p>;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
