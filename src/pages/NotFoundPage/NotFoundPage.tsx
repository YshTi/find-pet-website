import Container from '../../components/Container/Container';
import Button from '../../components/Button/Button';

import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <Container>
      <section className={styles.page}>
        <div className={styles.errorCode}>
          <span>4</span>

          <img
            src="/images/cat-not-found.webp"
            alt="Surprised cat"
            className={styles.cat}
            width={120}
            height={120}
          />

          <span>4</span>
        </div>

        <p className={styles.message}>
          Ooops! This page not found :(
        </p>

        <Button
          to="/home"
          variant="secondary"
          className={styles.homeButton}
        >
          To home page
        </Button>
      </section>
    </Container>
  );
}
