
import { Link } from 'react-router';

import Container from '../../components/Container/Container';
import Title from '../../components/Title/Title';
import PetBlock from '../../components/PetBlock/PetBlock';
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';

import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  return (
    <Container>
      <section className={styles.page}>
        
        <PetBlock
          image="/images/cat-register.webp"
          rectangleIcon="icon-rectangle"
          alt="Orange cat"
          petInfo={{
            name: 'Jack',
            birthday: '18.10.2021',
            description:
              'Jack is a gray Persian cat with green eyes. He loves to be pampered and groomed, and enjoys playing with toys.',
          }}
        />


        <div className={styles.formCard}>
          <div className={styles.content}>
            <Title>Registration</Title>

            <p className={styles.subtitle}>
              Thank you for your interest in our platform.
            </p>

            <RegistrationForm />

            <p className={styles.loginText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.loginLink}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
