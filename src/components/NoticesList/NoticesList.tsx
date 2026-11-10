import type { Notice } from '../../types/notices';

import NoticesItem from '../NoticesItem/NoticesItem';

import styles from './NoticesList.module.css';

interface NoticesListProps {
  notices: Notice[];
  favoriteIds?: string[];
  pendingFavoriteId?: string | null;
  onLearnMore: (id: string) => void;
  onFavorite: (id: string) => void;
}

export default function NoticesList({
  notices,
  favoriteIds = [],
  pendingFavoriteId = null,
  onLearnMore,
  onFavorite,
}: NoticesListProps) {
  return (
    <ul className={styles.list}>
      {notices.map(notice => (
        <li key={notice._id} className={styles.item}>
          <NoticesItem
            notice={notice}
            isFavorite={favoriteIds.includes(notice._id)}
            isFavoriteLoading={
              pendingFavoriteId === notice._id
            }
            onLearnMore={onLearnMore}
            onFavorite={onFavorite}
          />
        </li>
      ))}
    </ul>
  );
}
