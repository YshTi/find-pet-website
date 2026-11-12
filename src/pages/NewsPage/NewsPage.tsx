import { useEffect, useState } from 'react';

import Container from '../../components/Container/Container';
import NewsList from '../../components/NewsList/NewsList';
import Pagination from '../../components/Pagination/Pagination';
import SearchField from '../../components/SearchField/SearchField';
import Title from '../../components/Title/Title';

import { getNews } from '../../services/newsApi';
import type { News } from '../../types/news';

import styles from './NewsPage.module.css';

const NEWS_PER_PAGE = 6;

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadNews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getNews({
          keyword,
          page: currentPage,
          limit: NEWS_PER_PAGE,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setNews(data.results);
        setTotalPages(data.totalPages);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to fetch news:', error);
        setError('Failed to load news.');
        setNews([]);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadNews();

    return () => {
      controller.abort();
    };
  }, [currentPage, keyword]);

  const handleSearch = (newKeyword: string) => {
    setCurrentPage(1);
    setKeyword(newKeyword);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Container className={styles.newsPage}>
      <div className={styles.newsHeader}>
        <Title className={styles.newsTitle}>News</Title>

        <SearchField
          onSearch={handleSearch}
          className={styles.newsSearchField}
        />
      </div>

      {isLoading && <p>Loading news...</p>}

      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && (
        <>
          {news.length > 0 ? <NewsList news={news} /> : <p>No news found.</p>}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  );
}
