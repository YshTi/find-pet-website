import type { News } from '../../types/news';

import styles from './NewsItem.module.css';

interface NewsItemProps {
  news: News;
}

export default function NewsItem({ news }: NewsItemProps) {
  const { imgUrl, title, text, date, url } = news;

  const formattedDate = new Date(date).toLocaleDateString('en-GB');

  return (
    <article className={styles.newsItem}>
      <img src={imgUrl} alt={title} className={styles.image} loading="lazy" />

      <h3 className={styles.title}>{title}</h3>

      <p className={styles.description}>{text}</p>

      <div className={styles.articleFooter}>
        <time dateTime={date} className={styles.date}>
          {formattedDate}
        </time>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.readMore}
        >
          Read more
        </a>
      </div>
    </article>
  );
}
