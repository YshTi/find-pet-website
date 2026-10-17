import { api } from './api';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

interface ApiAuthResponse {
  name: string;
  email: string;
  token: string;
  avatar?: string;
  phone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

function normalizeAuthResponse(
  data: ApiAuthResponse,
): AuthResponse {
  if (!data.token || !data.email || !data.name) {
    throw new Error('Unexpected authentication response');
  }

  return {
    token: data.token,
    user: {
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      phone: data.phone,
    },
  };
}

export async function registerUser(
  userData: RegisterData,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiAuthResponse>(
    '/users/signup',
    userData,
  );

  return normalizeAuthResponse(data);
}

export async function loginUser(
  credentials: LoginData,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiAuthResponse>(
    '/users/signin',
    credentials,
  );

  return normalizeAuthResponse(data);
}
