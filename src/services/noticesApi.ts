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

  if (filters.sortBy) {
    params.set('sortBy', filters.sortBy);
  }

  return getJSON<NoticesResponse>(`/notices?${params.toString()}`, signal);
}

export function getNoticeById(
  id: string,
  signal?: AbortSignal,
): Promise<Notice> {
  return getJSON<Notice>(`/notices/${encodeURIComponent(id)}`, signal);
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
