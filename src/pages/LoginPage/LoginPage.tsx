import { Link } from 'react-router';

import Container from '../../components/Container/Container';
import Title from '../../components/Title/Title';
import PetBlock from '../../components/PetBlock/PetBlock';
import LoginForm from '../../components/LoginForm/LoginForm';

import styles from '../RegisterPage/RegisterPage.module.css';

export default function LoginPage() {
  return (
    <Container>
      <section className={styles.page}>
        <PetBlock
          image="/images/dog-login.webp"
          rectangleIcon="icon-rectangle"
          alt="Dog"
          petInfo={{
            name: 'Rich',
            birthday: '21.09.2020',
            description:
              'Rich would be the perfect addition to an active family that loves to play and go on walks. I bet he would love having a doggy playmate too!',
            avatar: '/images/dog-icon.webp',
          }}
        />

        <div className={styles.formCard}>
          <Title>Log in</Title>

          <p className={styles.subtitle}>
            Welcome! Please enter your credentials to log in to the platform:
          </p>

          <LoginForm />

          <p className={styles.cardText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.cardLink}>
              Register
            </Link>
          </p>
        </div>
      </section>
    </Container>
  );
}
