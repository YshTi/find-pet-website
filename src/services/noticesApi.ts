import type {
  Notice,
  NoticeFilters,
  NoticesResponse,
  LocationOption,
} from '../types/notices';

const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function getJSONWithAuth<T>(
  path: string,
  token: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function requestWithAuth(
  path: string,
  method: 'POST' | 'DELETE',
  token: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}

interface GetNoticesParams {
  filters: NoticeFilters;
  page: number;
  limit: number;
  signal?: AbortSignal;
}

export async function getNotices({
  filters,
  page,
  limit,
  signal,
}: GetNoticesParams): Promise<NoticesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.sex) {
    params.set('sex', filters.sex);
  }

  if (filters.species) {
    params.set('species', filters.species);
  }

  if (filters.locationId) {
    params.set('locationId', filters.locationId);
  }

  switch (filters.sortBy) {
    case 'popular':
      params.set('byPopularity', 'true');
      break;

    case 'unpopular':
      params.set('byPopularity', 'false');
      break;

    case 'cheap':
      params.set('byPrice', 'true');
      break;

    case 'expensive':
      params.set('byPrice', 'false');
      break;

    default:
      params.set('byDate', 'true');
      break;
  }

  return getJSON<NoticesResponse>(`/notices?${params.toString()}`, signal);
}

export function getNoticeById(
  id: string,
  token: string,
  signal?: AbortSignal,
): Promise<Notice> {
  return getJSONWithAuth<Notice>(
    `/notices/${encodeURIComponent(id)}`,
    token,
    signal,
  );
}

export function getNoticeCategories(signal?: AbortSignal): Promise<string[]> {
  return getJSON<string[]>('/notices/categories', signal);
}

export function getNoticeSexes(signal?: AbortSignal): Promise<string[]> {
  return getJSON<string[]>('/notices/sex', signal);
}

export function getNoticeSpecies(signal?: AbortSignal): Promise<string[]> {
  return getJSON<string[]>('/notices/species', signal);
}

export function searchLocations(
  keyword: string,
  signal?: AbortSignal,
): Promise<LocationOption[]> {
  const params = new URLSearchParams({
    keyword: keyword.trim(),
  });

  return getJSON<LocationOption[]>(`/cities?${params.toString()}`, signal);
}

export function addNoticeToFavorites(id: string, token: string): Promise<void> {
  return requestWithAuth(
    `/notices/favorites/add/${encodeURIComponent(id)}`,
    'POST',
    token,
  );
}

export function removeNoticeFromFavorites(
  id: string,
  token: string,
): Promise<void> {
  return requestWithAuth(
    `/notices/favorites/remove/${encodeURIComponent(id)}`,
    'DELETE',
    token,
  );
}
