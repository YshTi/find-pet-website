import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { LuEye, LuCheck } from 'react-icons/lu';

import Icon from '../Icon/Icon';
import Button from '../Button/Button';

import styles from './LoginForm.module.css';

interface LoginValues {
  email: string;
  password: string;
}

const initialValues: LoginValues = {
  email: '',
  password: '',
};

const emailRegex =
  /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

const validationSchema = Yup.object({
  email: Yup.string()
    .matches(emailRegex, 'Enter a valid Email')
    .required('Email is required'),

  password: Yup.string()
    .min(7, 'Password must contain at least 7 characters')
    .required('Password is required'),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (values: LoginValues) => {
    // Replace with the login API request.
    console.log('Validated login email:', values.email);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnBlur
      validateOnChange
    >
      {({ values, errors, touched, isSubmitting }) => {
        const emailError = Boolean(
          touched.email && errors.email,
        );

        const emailValid = Boolean(
          touched.email && values.email && !errors.email,
        );

        const passwordError = Boolean(
          touched.password && errors.password,
        );

        const passwordValid = Boolean(
          touched.password &&
            values.password &&
            !errors.password,
        );

        return (
          <Form className={styles.form} noValidate>
            <div className={styles.fieldGroup}>
              <div className={styles.inputWrapper}>
                <Field
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  aria-label="Email"
                  aria-invalid={emailError}
                  aria-describedby={
                    emailError ? 'login-email-feedback' : undefined
                  }
                  className={`${styles.input} ${
                    emailError
                      ? styles.error
                      : emailValid
                        ? styles.valid
                        : ''
                  }`}
                />

                {emailError && (
                  <Icon
                    name="icon-cross"
                    className={`${styles.crossIcon} ${styles.iconSize}`}
                  />
                )}

                {emailValid && (
                  <LuCheck
                    className={`${styles.checkIconAbsolute} ${styles.iconSize}`}
                    aria-hidden="true"
                  />
                )}
              </div>

              {emailError && (
                <p
                  id="login-email-feedback"
                  className={styles.errorText}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.passwordWrapper}>
                <Field
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-label="Password"
                  aria-invalid={passwordError}
                  aria-describedby={
                    passwordError || passwordValid
                      ? 'login-password-feedback'
                      : undefined
                  }
                  className={`${styles.input} ${
                    passwordError
                      ? styles.error
                      : passwordValid
                        ? styles.valid
                        : ''
                  } ${
                    !showPassword && values.password
                      ? styles.maskedInput
                      : ''
                  }`}
                />

                {!showPassword && values.password && (
                  <span
                    className={styles.stars}
                    aria-hidden="true"
                  >
                    {'*'.repeat(values.password.length)}
                  </span>
                )}

                <div className={styles.passwordIcons}>
                  {passwordValid && (
                    <LuCheck
                      className={`${styles.checkIcon} ${styles.iconSize}`}
                      aria-hidden="true"
                    />
                  )}

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <LuEye className={styles.iconSize} />
                    ) : (
                      <Icon
                        name="icon-eye-off"
                        className={styles.iconSize}
                      />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p
                  id="login-password-feedback"
                  className={styles.errorText}
                >
                  {errors.password}
                </p>
              )}

              {passwordValid && (
                <p
                  id="login-password-feedback"
                  className={styles.successText}
                >
                  Password is secure
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
