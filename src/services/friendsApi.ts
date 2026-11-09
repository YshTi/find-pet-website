import type { Friend } from '../types/friends';

const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(
  /\/+$/,
  '',
);

export async function getFriends(
  signal?: AbortSignal,
): Promise<Friend[]> {
  const response = await fetch(`${BASE_URL}/friends/`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch friends: ${response.status}`,
    );
  }

  return (await response.json()) as Friend[];
}
