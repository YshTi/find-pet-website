import type { Friend, WorkDay } from '../../types/friends';

import styles from './FriendsItem.module.css';

interface FriendsItemProps {
  friend: Friend;
}

function formatWorkingHours(workDays: WorkDay[] | null | undefined): string {
  if (!workDays?.length) return 'Day and night';

  const openDays = workDays.filter((day) => day.isOpen && day.from && day.to);

  if (!openDays.length) return 'Day and night';

  const firstDay = openDays[0];

  return `${firstDay.from} - ${firstDay.to}`;
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 12 && cleaned.startsWith('380')) {
    return cleaned.replace(/^38(\d{3})(\d{3})(\d{4})$/, '+38 $1 $2 $3');
  }

  return phone;
}

export default function FriendsItem({ friend }: FriendsItemProps) {
  const { title, url, imageUrl, address, addressUrl, phone, email, workDays } =
    friend;

  const workingHours = formatWorkingHours(workDays);
  const phoneHref = phone?.replace(/[^\d+]/g, '');

  return (
    <article className={styles.card}>
      <span className={styles.workingHours}>{workingHours}</span>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.logoLink}
        aria-label={`Visit ${title} website`}
      >
        <img
          src={imageUrl}
          alt={`${title} logo`}
          className={styles.logo}
          loading="lazy"
        />
      </a>

      <div className={styles.content}>
        <h2 className={styles.title}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.titleLink}
          >
            {title}
          </a>
        </h2>

        <div className={styles.contacts}>
          {email && (
            <p className={styles.contact}>
              <span className={styles.label}>Email: </span>
              <a href={`mailto:${email}`} className={styles.contactLink}>
                {email}
              </a>
            </p>
          )}

          {(address || url) && (
            <p className={styles.contact}>
              <span className={styles.label}>Address: </span>

              {address ? (
                addressUrl ? (
                  <a
                    href={addressUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    {address}
                  </a>
                ) : (
                  <span>{address}</span>
                )
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  website only
                </a>
              )}
            </p>
          )}

          {(phone || email) && (
            <p className={styles.contact}>
              <span className={styles.label}>Phone: </span>

              {phone ? (
                <a href={`tel:${phoneHref}`} className={styles.contactLink}>
                  {formatPhone(phone)}
                </a>
              ) : (
                <a href={`mailto:${email}`} className={styles.contactLink}>
                  email only
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
