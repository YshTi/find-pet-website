import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import Button from '../Button/Button';
import Icon from '../Icon/Icon';

import type { Notice } from '../../types/notices';

import styles from './ModalNotice.module.css';

interface ModalNoticeProps {
  notice: Notice | null;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  onClose: () => void;
  onFavorite: (id: string) => void;
}

interface NoticeContact {
  email?: string;
  phone?: string;
}

type NoticeDetails = Notice & {
  imgURL?: string;
  imgUrl?: string;
  popularity?: number;
  price?: number;
  birthday?: string;
  comment?: string;
  user?: NoticeContact;
};

const formatText = (value?: string): string => {
  if (!value) return 'Unknown';

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatDate = (value?: string): string => {
  if (!value) return 'Unknown';

  const date = value.slice(0, 10);
  const parts = date.split('-');

  if (parts.length !== 3) return value;

  const [year, month, day] = parts;

  return `${day}.${month}.${year}`;
};

export default function ModalNotice({
  notice,
  isFavorite,
  isFavoriteLoading,
  onClose,
  onFavorite,
}: ModalNoticeProps) {
  const titleId = useId();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!notice) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }

      if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href]',
        );

        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [notice]);

  if (!notice) return null;

  const pet = notice as NoticeDetails;

  const imageUrl = pet.imgURL || pet.imgUrl;
  const contactEmail = pet.user?.email;
  const contactPhone = pet.user?.phone;

  const contactHref = contactEmail
    ? `mailto:${contactEmail}`
    : contactPhone
      ? `tel:${contactPhone}`
      : null;

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
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notice details"
        >
          <Icon name="icon-cross" className={styles.closeIcon} />
        </button>

        {imageUrl && (
          <div className={styles.imageWrapper}>
            <img src={imageUrl} alt={pet.title} className={styles.image} />

            <span className={styles.categoryBadge}>
              {formatText(pet.category)}
            </span>
          </div>
        )}

        <h2 id={titleId} className={styles.title}>
          {pet.title}
        </h2>

        <div className={styles.popularity}>
          <span className={styles.star}>★</span>
          <span>{pet.popularity ?? 0}</span>
        </div>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt>Name</dt>
            <dd>{pet.name || 'Unknown'}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Birthday</dt>
            <dd>{formatDate(pet.birthday)}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Sex</dt>
            <dd>{formatText(pet.sex)}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Species</dt>
            <dd>{formatText(pet.species)}</dd>
          </div>

          <div className={styles.detail}>
            <dt>Category</dt>
            <dd>{formatText(pet.category)}</dd>
          </div>
        </dl>

        <p className={styles.comment}>
          {pet.comment || 'No description available.'}
        </p>

        {typeof pet.price === 'number' && (
          <p className={styles.price}>${pet.price.toFixed(2)}</p>
        )}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            className={styles.favoriteButton}
            disabled={isFavoriteLoading}
            onClick={() => onFavorite(pet._id)}
          >
            {isFavoriteLoading
              ? 'Updating...'
              : isFavorite
                ? 'Remove from'
                : 'Add to'}

            <Icon name="icon-heart" className={styles.heartIcon} />
          </Button>

          {contactHref ? (
            <Button
              to={contactHref}
              variant="secondary"
              className={styles.contactButton}
            >
              Contact
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className={styles.contactButton}
              disabled
            >
              Contact
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
