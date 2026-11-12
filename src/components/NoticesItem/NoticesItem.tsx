import type { Notice } from '../../types/notices';

import Icon from '../Icon/Icon';

import styles from './NoticesItem.module.css';

interface NoticesItemProps {
  notice: Notice;
  isFavorite: boolean;
  isFavoriteLoading?: boolean;
  onLearnMore: (id: string) => void;
  onFavorite: (id: string) => void;
}

function formatBirthday(date: string | null): string {
  if (!date) return 'Unknown';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return parsed.toLocaleDateString('en-GB');
}

export default function NoticesItem({
  notice,
  isFavorite,
  isFavoriteLoading = false,
  onLearnMore,
  onFavorite,
}: NoticesItemProps) {
  return (
    <article className={styles.card}>
      <img
        src={notice.imgURL}
        alt={notice.title}
        className={styles.image}
        loading="lazy"
      />

      <div className={styles.content}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{notice.title}</h2>

          <span className={styles.popularity}>
            <Icon name="icon-star" className={styles.starIcon} />
            {notice.popularity}
          </span>
        </div>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt>Name</dt>
            <dd>{notice.name}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Birthday</dt>
            <dd>{formatBirthday(notice.birthday)}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Sex</dt>
            <dd>{notice.sex}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Species</dt>
            <dd>{notice.species}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Category</dt>
            <dd>{notice.category}</dd>
          </div>
        </dl>

        <p className={styles.comment}>{notice.comment}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.learnMore}
            onClick={() => onLearnMore(notice._id)}
          >
            Learn more
          </button>

          <button
            type="button"
            className={styles.favoriteButton}
            onClick={() => onFavorite(notice._id)}
            disabled={isFavoriteLoading}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
            aria-pressed={isFavorite}
          >
            <Icon
              name="icon-heart"
              className={`${styles.heartIcon} ${
                isFavorite ? styles.isFavorite : ''
              }`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
