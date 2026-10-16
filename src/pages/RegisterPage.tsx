import { Link } from 'react-router';
import RegistrationForm from '../components/RegistrationForm/RegistrationForm';

export default function RegisterPage() {
  return (
    <section className="container">
      <h1>Registration</h1>

      <RegistrationForm />

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
