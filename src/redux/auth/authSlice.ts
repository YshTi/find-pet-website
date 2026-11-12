import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isRefreshing: boolean;
}

const savedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: null,
  token: savedToken,
  isLoggedIn: Boolean(savedToken),
  isRefreshing: Boolean(savedToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.isRefreshing = false;
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },

    logout: () => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isRefreshing: false,
    }),
  },
});

export const { setCredentials, updateUser, setRefreshing, logout } =
  authSlice.actions;

export default authSlice.reducer;
