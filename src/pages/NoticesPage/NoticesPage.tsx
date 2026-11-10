import { useEffect, useState } from 'react';

import Container from '../../components/Container/Container';
import NoticesFilters from '../../components/NoticesFilters/NoticesFilters';
import NoticesList from '../../components/NoticesList/NoticesList';
import Pagination from '../../components/Pagination/Pagination';
import ModalAttention from '../../components/ModalAttention/ModalAttention';
import ModalNotice from '../../components/ModalNotice/ModalNotice';

import {
  getNotices,
  getNoticeById,
  getNoticeCategories,
  getNoticeSexes,
  getNoticeSpecies,
} from '../../services/noticesApi';

import { getCurrentUserFull } from '../../services/userApi';

import {
  defaultNoticeFilters,
  type Notice,
  type NoticeFilters,
} from '../../types/notices';

import type { CurrentUserFull } from '../../types/user';

import styles from './NoticesPage.module.css';

const NOTICES_PER_PAGE = 6;

interface NoticesPageProps {
  token?: string | null;

  // Must call the real favorite add/remove API.
  onToggleFavorite?: (
    id: string,
    isFavorite: boolean,
  ) => Promise<void>;
}

export default function NoticesPage({
  token = null,
  onToggleFavorite,
}: NoticesPageProps) {
  const isAuthenticated = Boolean(token);

  const [filters, setFilters] = useState<NoticeFilters>(
    defaultNoticeFilters,
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [notices, setNotices] = useState<Notice[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const [sexes, setSexes] = useState<string[]>([]);
  const [species, setSpecies] = useState<string[]>([]);

  const [currentUser, setCurrentUser] =
    useState<CurrentUserFull | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isAttentionOpen, setIsAttentionOpen] =
    useState(false);

  const [selectedNotice, setSelectedNotice] =
    useState<Notice | null>(null);

  const [isDetailsLoading, setIsDetailsLoading] =
    useState(false);

  const [pendingFavoriteId, setPendingFavoriteId] =
    useState<string | null>(null);

  // Favorites come from the authenticated user's profile.
  const favoriteIds =
    currentUser?.noticesFavorites?.map(
      notice => notice._id,
    ) ?? [];

  // Load filter options independently.
  useEffect(() => {
    const controller = new AbortController();

    const loadOptions = async () => {
      const results = await Promise.allSettled([
        getNoticeCategories(controller.signal),
        getNoticeSexes(controller.signal),
        getNoticeSpecies(controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const [
        categoriesResult,
        sexesResult,
        speciesResult,
      ] = results;

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      } else {
        console.error(
          'Categories request failed:',
          categoriesResult.reason,
        );
      }

      if (sexesResult.status === 'fulfilled') {
        setSexes(sexesResult.value);
      } else {
        console.error(
          'Sexes request failed:',
          sexesResult.reason,
        );
      }

      if (speciesResult.status === 'fulfilled') {
        setSpecies(speciesResult.value);
      } else {
        console.error(
          'Species request failed:',
          speciesResult.reason,
        );
      }
    };

    void loadOptions();

    return () => controller.abort();
  }, []);

  // Load notices when the page or filters change.
  useEffect(() => {
    const controller = new AbortController();

    const loadNotices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getNotices({
          filters,
          page,
          limit: NOTICES_PER_PAGE,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setNotices(data.results);
        setTotalPages(data.totalPages);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to fetch notices:', error);

        setError('Failed to load notices.');
        setNotices([]);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadNotices();

    return () => controller.abort();
  }, [filters, page]);

  
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const loadUser = async () => {
      try {
        setIsUserLoading(true);

        const user = await getCurrentUserFull(
          token,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setCurrentUser(user);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to load current user:', error);
        setCurrentUser(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsUserLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      controller.abort();
    };
  }, [token]);


  const handleFiltersChange = (
    nextFilters: NoticeFilters,
  ) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ ...defaultNoticeFilters });
    setPage(1);
  };

  const handleLearnMore = async (id: string) => {
    if (!isAuthenticated) {
      setIsAttentionOpen(true);
      return;
    }

    try {
      setIsDetailsLoading(true);
      setError(null);

      const notice = await getNoticeById(id);

      setSelectedNotice(notice);
    } catch (error) {
      console.error(
        'Failed to load notice details:',
        error,
      );

      setError('Failed to load notice details.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleFavorite = async (id: string) => {
    if (!isAuthenticated) {
      setIsAttentionOpen(true);
      return;
    }

    if (!token || !currentUser || !onToggleFavorite) {
      setError('Favorites are not available.');
      return;
    }

    if (pendingFavoriteId) return;

    const isFavorite = favoriteIds.includes(id);

    try {
      setPendingFavoriteId(id);
      setError(null);

      await onToggleFavorite(id, isFavorite);

      // Refresh the actual favorites from the backend.
      const updatedUser = await getCurrentUserFull(token);

      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Failed to update favorites:', error);

      setError('Failed to update favorites.');
    } finally {
      setPendingFavoriteId(null);
    }
  };

  return (
    <main className={styles.page}>
      <Container className={styles.petFilters}>
        <h1 className={styles.title}>
          Find your favorite pet
        </h1>

        <NoticesFilters
          filters={filters}
          options={{
            categories,
            sexes,
            species,
          }}
          onChange={handleFiltersChange}
          onReset={handleReset}
        />

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </Container>

      <Container>
        {isLoading ? (
          <p className={styles.status}>
            Loading notices...
          </p>
        ) : notices.length > 0 ? (
          <>
            <NoticesList
              notices={notices}
              favoriteIds={favoriteIds}
              pendingFavoriteId={
                isUserLoading ? null : pendingFavoriteId
              }
              onLearnMore={id =>
                void handleLearnMore(id)
              }
              onFavorite={id =>
                void handleFavorite(id)
              }
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className={styles.pagination}
            />
          </>
        ) : !error ? (
          <p className={styles.status}>
            No notices found.
          </p>
        ) : null}

        {isDetailsLoading && (
          <p role="status">
            Loading notice details...
          </p>
        )}
      </Container>

      <ModalAttention
        isOpen={isAttentionOpen}
        onClose={() => setIsAttentionOpen(false)}
      />

      <ModalNotice
        notice={selectedNotice}
        isFavorite={
          selectedNotice
            ? favoriteIds.includes(selectedNotice._id)
            : false
        }
        isFavoriteLoading={
          pendingFavoriteId === selectedNotice?._id
        }
        onClose={() => setSelectedNotice(null)}
        onFavorite={id => void handleFavorite(id)}
      />
    </main>
  );
}
