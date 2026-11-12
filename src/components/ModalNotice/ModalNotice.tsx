import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { Notice } from '../../types/notices';

import Icon from '../Icon/Icon';

import styles from './ModalNotice.module.css';

interface ModalNoticeProps {
  notice: Notice | null;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  onClose: () => void;
  onFavorite: (id: string) => void;
}

function formatBirthday(birthday: string | null): string {
  if (!birthday) return 'Unknown';

  const date = new Date(birthday);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString('en-GB');
}

export default function ModalNotice({
  notice,
  isFavorite,
  isFavoriteLoading,
  onClose,
  onFavorite,
}: ModalNoticeProps) {
  useEffect(() => {
    if (!notice) return;

    const previousOverflow = document.body.style.overflow;

    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener('keydown', handleKeyDown);

      previousFocus?.focus();
    };
  }, [notice, onClose]);

  if (!notice) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notice"
        >
          <Icon name="icon-cross" />
        </button>

        <img src={notice.imgURL} alt={notice.title} className={styles.image} />

        <h2 id="notice-modal-title">{notice.title}</h2>

        <p>Popularity: {notice.popularity}</p>

        <p>Name: {notice.name}</p>

        <p>Birthday: {formatBirthday(notice.birthday)}</p>

        <p>Sex: {notice.sex}</p>
        <p>Species: {notice.species}</p>
        <p>Category: {notice.category}</p>

        <p>{notice.comment}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.favoriteButton}
            onClick={() => onFavorite(notice._id)}
            disabled={isFavoriteLoading}
          >
            {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </button>

          {/*
            Contact button:
            Await the confirmed GET notice-by-ID
            response containing the notice owner's
            email or phone number.

            Do not use notice.user.email because
            notice.user is an ID string.
          */}
        </div>
      </div>
    </div>,
    document.body,
  );
}
