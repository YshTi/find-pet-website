import Container from '../../components/Container/Container';

import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <Container className={styles.homeContainer}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Take good <span className={styles.heroHighlight}>care </span> of
            your small pets
          </h1>

          <p className={styles.heroSubtitle}>
            Choosing a pet for your home is a choice that is meant to enrich
            your life with immeasurable joy and tenderness.
          </p>
        </div>
      </section>

      <picture className={styles.imageWrapper}>
        <source srcSet="/images/homepage@2x.webp 2x" type="image/webp" />
        <img
          src="/images/homepage.webp"
          alt="Woman hugging her dog"
          className={styles.homeImage}
        />
      </picture>
    </Container>
  );
}
