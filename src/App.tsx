import { Navigate, Route, Routes } from 'react-router';

import MainLayout from './layouts/MainLayout';
import PrivateRoute from './router/PrivateRoute';
import RestrictedRoute from './router/RestrictedRoute';

import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import NoticesPage from './pages/NoticesPage';
import FriendsPage from './pages/FriendsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AddPetPage from './pages/AddPetPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />

        <Route path="home" element={<HomePage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="friends" element={<FriendsPage />} />

        <Route element={<RestrictedRoute />}>
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="add-pet" element={<AddPetPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
