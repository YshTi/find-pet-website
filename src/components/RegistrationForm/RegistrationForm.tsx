import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const emailRegex =
  /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),

  email: Yup.string()
    .matches(emailRegex, 'Invalid email format')
    .required('Email is required'),

  password: Yup.string()
    .min(7, 'Password must contain at least 7 characters')
    .required('Password is required'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface RegistrationValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: RegistrationValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegistrationForm() {
  const handleSubmit = (values: RegistrationValues) => {
    const { confirmPassword, ...registrationData } = values;

    void confirmPassword;

    console.log('Validated registration data:', {
      name: registrationData.name,
      email: registrationData.email,
    });

    // Connect registration API here.
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isValid, dirty }) => (
        <Form noValidate>
          <div>
            <label htmlFor="name">Name</label>
            <Field id="name" name="name" type="text" />
            <ErrorMessage name="name" component="p" />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="p" />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Field
              id="password"
              name="password"
              type="password"
            />
            <ErrorMessage name="password" component="p" />
          </div>

          <div>
            <label htmlFor="confirmPassword">
              Confirm password
            </label>
            <Field
              id="confirmPassword"
              name="confirmPassword"
              type="password"
            />
            <ErrorMessage
              name="confirmPassword"
              component="p"
            />
          </div>

          <button
            type="submit"
            disabled={!dirty || !isValid}
          >
            Registration
          </button>
        </Form>
      )}
    </Formik>
  );
}
