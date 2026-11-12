import { useEffect } from 'react';
import axios from 'axios';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';

import { updateUser, setRefreshing, logout } from '../../redux/auth/authSlice';

import { getCurrentUser } from '../../services/authApi';
import { api } from '../../services/api';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) {
      dispatch(setRefreshing(false));
      return;
    }

    let active = true;

    const restoreSession = async () => {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      try {
        const user = await getCurrentUser(token);

        if (!active) return;

        dispatch(updateUser(user));
      } catch (error) {
        if (!active) return;

        // Only invalidate the session if the token is rejected.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common.Authorization;
          dispatch(logout());
        }
      } finally {
        if (active) {
          dispatch(setRefreshing(false));
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [dispatch, token]);

  return null;
}
