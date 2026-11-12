import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import Container from '../../components/Container/Container';
import NoticesFilters from '../../components/NoticesFilters/NoticesFilters';
import NoticesList from '../../components/NoticesList/NoticesList';
import Pagination from '../../components/Pagination/Pagination';
import ModalAttention from '../../components/ModalAttention/ModalAttention';
import ModalNotice from '../../components/ModalNotice/ModalNotice';

import { useAppSelector } from '../../redux/hooks';

import {
  getNotices,
  getNoticeById,
  getNoticeCategories,
  getNoticeSexes,
  getNoticeSpecies,
  addNoticeToFavorites,
  removeNoticeFromFavorites,
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
const BACKEND_BATCH_SIZES = [100, 500, 1000, 5000];

type SortableNotice = Notice & {
  price?: number;
  popularity?: number;
  createdAt?: string;
  updatedAt?: string;
  location?: string;
};

function getUniqueNotices(notices: Notice[]): Notice[] {
  const unique = new Map<string, Notice>();

  for (const notice of notices) {
    if (!unique.has(notice._id)) {
      unique.set(notice._id, notice);
    }
  }

  return Array.from(unique.values());
}

async function loadAllNotices(signal: AbortSignal): Promise<Notice[]> {
  for (const limit of BACKEND_BATCH_SIZES) {
    const data = await getNotices({
      filters: defaultNoticeFilters,
      page: 1,
      limit,
      signal,
    });

    if (signal.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    if (data.totalPages <= 1) {
      return getUniqueNotices(data.results);
    }
  }

  throw new Error(
    'The complete notices collection exceeds the supported batch size.',
  );
}

function filterNotices(notices: Notice[], filters: NoticeFilters): Notice[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return notices.filter((notice) => {
    const pet = notice as SortableNotice;

    if (keyword) {
      const searchableText = [pet.title, pet.name, pet.comment]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(keyword)) {
        return false;
      }
    }

    if (filters.category && pet.category !== filters.category) {
      return false;
    }

    if (filters.sex && pet.sex !== filters.sex) {
      return false;
    }

    if (filters.species && pet.species !== filters.species) {
      return false;
    }

    if (filters.locationId && pet.location !== filters.locationId) {
      return false;
    }

    if (
      (filters.sortBy === 'cheap' || filters.sortBy === 'expensive') &&
      typeof pet.price !== 'number'
    ) {
      return false;
    }

    return true;
  });
}

function sortNotices(
  notices: Notice[],
  sortBy: NoticeFilters['sortBy'],
): Notice[] {
  const sorted = [...notices] as SortableNotice[];

  const compareIds = (a: SortableNotice, b: SortableNotice) =>
    a._id.localeCompare(b._id);

  switch (sortBy) {
    case 'popular':
      sorted.sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0) || compareIds(a, b),
      );
      break;

    case 'unpopular':
      sorted.sort(
        (a, b) => (a.popularity ?? 0) - (b.popularity ?? 0) || compareIds(a, b),
      );
      break;

    case 'cheap':
      sorted.sort((a, b) => {
        const aPrice =
          typeof a.price === 'number' ? a.price : Number.POSITIVE_INFINITY;

        const bPrice =
          typeof b.price === 'number' ? b.price : Number.POSITIVE_INFINITY;

        return aPrice - bPrice || compareIds(a, b);
      });
      break;

    case 'expensive':
      sorted.sort((a, b) => {
        const aPrice =
          typeof a.price === 'number' ? a.price : Number.NEGATIVE_INFINITY;

        const bPrice =
          typeof b.price === 'number' ? b.price : Number.NEGATIVE_INFINITY;

        return bPrice - aPrice || compareIds(a, b);
      });
      break;

    default:
      sorted.sort((a, b) => {
        const aDate = a.updatedAt ?? a.createdAt ?? '';

        const bDate = b.updatedAt ?? b.createdAt ?? '';

        return bDate.localeCompare(aDate) || compareIds(a, b);
      });
      break;
  }

  return sorted;
}

export default function NoticesPage() {
  const token = useAppSelector((state) => state.auth.token);

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const isRefreshing = useAppSelector((state) => state.auth.isRefreshing);

  const isAuthenticated = isLoggedIn && Boolean(token);

  const [filters, setFilters] = useState<NoticeFilters>({
    ...defaultNoticeFilters,
  });

  const [page, setPage] = useState(1);

  const [allNotices, setAllNotices] = useState<Notice[]>([]);

  const [categories, setCategories] = useState<string[]>([]);

  const [sexes, setSexes] = useState<string[]>([]);

  const [species, setSpecies] = useState<string[]>([]);

  const [userData, setUserData] = useState<{
    token: string;
    user: CurrentUserFull;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isUserLoading, setIsUserLoading] = useState(false);

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isAttentionOpen, setIsAttentionOpen] = useState(false);

  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(
    null,
  );

  const currentUser =
    isAuthenticated && userData?.token === token ? userData.user : null;

  const favoriteIds =
    currentUser?.noticesFavorites?.map((notice) => notice._id) ?? [];

  const filteredNotices = useMemo(() => {
    const matchingNotices = filterNotices(allNotices, filters);

    return sortNotices(matchingNotices, filters.sortBy);
  }, [allNotices, filters]);

  const totalPages = Math.ceil(filteredNotices.length / NOTICES_PER_PAGE);

  const notices = useMemo(() => {
    const startIndex = (page - 1) * NOTICES_PER_PAGE;

    return filteredNotices.slice(startIndex, startIndex + NOTICES_PER_PAGE);
  }, [filteredNotices, page]);

  useEffect(() => {
    const controller = new AbortController();

    const loadOptions = async () => {
      const results = await Promise.allSettled([
        getNoticeCategories(controller.signal),
        getNoticeSexes(controller.signal),
        getNoticeSpecies(controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const [categoriesResult, sexesResult, speciesResult] = results;

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      } else {
        console.error('Failed to load categories:', categoriesResult.reason);
      }

      if (sexesResult.status === 'fulfilled') {
        setSexes(sexesResult.value);
      } else {
        console.error('Failed to load genders:', sexesResult.reason);
      }

      if (speciesResult.status === 'fulfilled') {
        setSpecies(speciesResult.value);
      } else {
        console.error('Failed to load species:', speciesResult.reason);
      }
    };

    void loadOptions();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadNotices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await loadAllNotices(controller.signal);

        if (controller.signal.aborted) return;

        setAllNotices(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to load notices:', error);

        setError('Failed to load notices.');
        setAllNotices([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadNotices();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const controller = new AbortController();

    const loadUser = async () => {
      try {
        setIsUserLoading(true);

        const user = await getCurrentUserFull(token, controller.signal);

        if (controller.signal.aborted) return;

        setUserData({ token, user });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to load current user:', error);

        setUserData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsUserLoading(false);
        }
      }
    };

    void loadUser();

    return () => controller.abort();
  }, [token, isAuthenticated]);

  const handleFiltersChange = (nextFilters: NoticeFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ ...defaultNoticeFilters });
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  const handleLearnMore = async (id: string) => {
    if (isRefreshing) return;

    if (!isAuthenticated) {
      setIsAttentionOpen(true);
      return;
    }

    if (isDetailsLoading) return;

    try {
      setIsDetailsLoading(true);
      setSelectedNotice(null);

      if (!token) {
        setIsAttentionOpen(true);
        return;
      }

      const notice = await getNoticeById(id, token);

      setSelectedNotice(notice);
    } catch (error) {
      console.error('Failed to load notice details:', error);

      toast.error('Failed to load notice details.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleFavorite = async (id: string) => {
    if (isRefreshing) return;

    if (!isAuthenticated || !token) {
      setIsAttentionOpen(true);
      return;
    }

    if (isUserLoading || !currentUser) {
      toast.error('Your profile is still loading.');
      return;
    }

    if (pendingFavoriteId) return;

    const isFavorite = favoriteIds.includes(id);

    try {
      setPendingFavoriteId(id);

      if (isFavorite) {
        await removeNoticeFromFavorites(id, token);
      } else {
        await addNoticeToFavorites(id, token);
      }

      const updatedUser = await getCurrentUserFull(token);

      setUserData({
        token,
        user: updatedUser,
      });

      toast.success(
        isFavorite ? 'Removed from favorites.' : 'Added to favorites.',
      );
    } catch (error) {
      console.error('Failed to update favorites:', error);

      toast.error('Failed to update favorites.');
    } finally {
      setPendingFavoriteId(null);
    }
  };

  return (
    <div className={styles.page}>
      <Container className={styles.petFilters}>
        <h1 className={styles.title}>Find your favorite pet</h1>

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
          <p className={styles.status}>Loading notices...</p>
        ) : notices.length > 0 ? (
          <>
            <NoticesList
              notices={notices}
              favoriteIds={favoriteIds}
              pendingFavoriteId={isUserLoading ? null : pendingFavoriteId}
              onLearnMore={(id) => {
                void handleLearnMore(id);
              }}
              onFavorite={(id) => {
                void handleFavorite(id);
              }}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className={styles.pagination}
            />
          </>
        ) : !error ? (
          <p className={styles.status}>No notices found.</p>
        ) : null}

        {isDetailsLoading && (
          <p role="status" className={styles.status}>
            Loading notice details...
          </p>
        )}
      </Container>

      <ModalAttention
        isOpen={isAttentionOpen}
        onClose={() => setIsAttentionOpen(false)}
      />

      <ModalNotice
        notice={isAuthenticated ? selectedNotice : null}
        isFavorite={
          selectedNotice ? favoriteIds.includes(selectedNotice._id) : false
        }
        isFavoriteLoading={
          isUserLoading ||
          (selectedNotice !== null && pendingFavoriteId === selectedNotice._id)
        }
        onClose={() => setSelectedNotice(null)}
        onFavorite={(id) => {
          void handleFavorite(id);
        }}
      />
    </div>
  );
}
