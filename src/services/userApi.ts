import type { CurrentUser, CurrentUserFull } from '../types/user';

const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

async function getAuthorizedUser<T>(
  path: string,
  token: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getCurrentUser(
  token: string,
  signal?: AbortSignal,
): Promise<CurrentUser> {
  return getAuthorizedUser<CurrentUser>('/users/current', token, signal);
}

export function getCurrentUserFull(
  token: string,
  signal?: AbortSignal,
): Promise<CurrentUserFull> {
  return getAuthorizedUser<CurrentUserFull>(
    '/users/current/full',
    token,
    signal,
  );
}
