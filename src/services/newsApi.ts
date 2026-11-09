import type { NewsResponse } from '../types/news';

const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(
  /\/+$/,
  '',
);

interface GetNewsParams {
  keyword?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export async function getNews({
  keyword = '',
  page = 1,
  limit = 6,
  signal,
}: GetNewsParams = {}): Promise<NewsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (keyword.trim()) {
    params.set('keyword', keyword.trim());
  }

  const response = await fetch(
    `${BASE_URL}/news?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch news: ${response.status}`,
    );
  }

  return (await response.json()) as NewsResponse;
}
