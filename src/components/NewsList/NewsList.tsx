import type { News } from '../../types/news';

import NewsItem from '../NewsItem/NewsItem';

import styles from './NewsList.module.css';

interface NewsListProps {
  news: News[];
}

export default function NewsList({ news }: NewsListProps) {
  return (
    <ul className={styles.list}>
      {news.map((item) => (
        <li key={item._id}>
          <NewsItem news={item} />
        </li>
      ))}
    </ul>
  );
}
