import { useEffect, useState } from 'react';

import Icon from '../Icon/Icon';

import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageItem = number | 'ellipsis';

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  visibleCount: number,
): PageItem[] {
  const groupIndex = Math.floor(
    (currentPage - 1) / visibleCount,
  );

  const startPage = groupIndex * visibleCount + 1;

  const endPage = Math.min(
    startPage + visibleCount - 1,
    totalPages,
  );

  const pages: PageItem[] = [];

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page);
  }

  if (endPage < totalPages) {
    pages.push('ellipsis');
  }

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 768px)').matches
      ? 3
      : 2,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleChange = (event: MediaQueryListEvent) => {
      setVisibleCount(event.matches ? 3 : 2);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const visiblePages = getVisiblePages(
    currentPage,
    totalPages,
    visibleCount,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (page === currentPage) return;

    onPageChange(page);
  };

  const handleNextGroup = () => {
    const groupIndex = Math.floor(
      (currentPage - 1) / visibleCount,
    );

    const nextGroupStart =
      (groupIndex + 1) * visibleCount + 1;

    handlePageChange(nextGroupStart);
  };

  return (
    <nav
      className={`${styles.pagination} ${className}`}
      aria-label="Pagination"
    >
      <div className={styles.paginButtons}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
          aria-label="First page"
        >
          <Icon
            name="icon-small-left"
            className={styles.arrowIconDouble}
          />
          <Icon
            name="icon-small-left"
            className={styles.arrowIconDouble}
          />
        </button>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <Icon
            name="icon-small-left"
            className={styles.arrowIcon}
          />
        </button>
      </div>

      <div className={styles.pages}>
        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <button
              key={`ellipsis-${index}`}
              type="button"
              className={styles.ellipsis}
              onClick={handleNextGroup}
              aria-label="Next group of pages"
            >
              ...
            </button>
          ) : (
            <button
              key={page}
              type="button"
              className={`${styles.page} ${
                currentPage === page ? styles.active : ''
              }`}
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={
                currentPage === page ? 'page' : undefined
              }
            >
              {page}
            </button>
          ),
        )}
      </div>

      <div className={styles.paginButtons}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Next page"
        >
          <Icon
            name="icon-small-right"
            className={styles.arrowIcon}
          />
        </button>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => handlePageChange(totalPages)}
          disabled={isLastPage}
          aria-label="Last page"
        >
          <Icon
            name="icon-small-right"
            className={styles.arrowIconDouble}
          />
          <Icon
            name="icon-small-right"
            className={styles.arrowIconDouble}
          />
        </button>
      </div>
    </nav>
  );
}
