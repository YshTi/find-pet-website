import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import type { FormikHelpers } from 'formik';
import type { ChangeEvent } from 'react';
import * as Yup from 'yup';
import { LuEye } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';

import Icon from '../Icon/Icon';
import Button from '../Button/Button';

import { useAppDispatch } from '../../redux/hooks';
import { setCredentials } from '../../redux/auth/authSlice';
import { loginUser } from '../../services/authApi';
import { api } from '../../services/api';

import styles from './LoginForm.module.css';

interface LoginValues {
  email: string;
  password: string;
}

interface LoginStatus {
  serverError?: string;
}

const initialValues: LoginValues = {
  email: '',
  password: '',
};

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

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

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (
    values: LoginValues,
    { setStatus }: FormikHelpers<LoginValues>,
  ) => {
    setStatus(null);

    try {
      const response = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });

      // Set the token for future authenticated requests.
      api.defaults.headers.common.Authorization = `Bearer ${response.token}`;

      localStorage.setItem('token', response.token);

      // Save the user and token in Redux.
      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
        }),
      );

      toast.success('Successfully logged in!');

      navigate('/profile', { replace: true });
    } catch (error: unknown) {
      let message = 'Something went wrong. Please try again.';

      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        message =
          typeof apiMessage === 'string'
            ? apiMessage
            : error.response?.status === 401
              ? 'Email or password is invalid'
              : 'Login failed. Please try again.';
      } else if (error instanceof Error) {
        message = error.message;
      }

      // Display the inline error and turn both fields red.
      setStatus({
        serverError: message,
      } satisfies LoginStatus);

      // Also display the popup toast notification.
      toast.error(message);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      initialStatus={null}
      onSubmit={handleSubmit}
      validateOnBlur
      validateOnChange
    >
      {({
        values,
        errors,
        touched,
        submitCount,
        isSubmitting,
        status,
        setStatus,
        setFieldValue,
      }) => {
        const serverErrorMessage = (status as LoginStatus | null)?.serverError;

        const serverError = Boolean(serverErrorMessage);

        const emailError = Boolean(
          serverError || ((touched.email || submitCount > 0) && errors.email),
        );

        const emailValid = Boolean(
          !serverError && touched.email && values.email && !errors.email,
        );

        const passwordError = Boolean(
          serverError ||
          ((touched.password || submitCount > 0) && errors.password),
        );

        const passwordValid = Boolean(
          !serverError &&
          touched.password &&
          values.password &&
          !errors.password,
        );

        const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
          setStatus(null);

          void setFieldValue('email', event.target.value);
        };

        const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
          setStatus(null);

          void setFieldValue('password', event.target.value);
        };

        return (
          <Form className={styles.form} noValidate>
            {/* Email */}

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
                    emailError
                      ? serverError
                        ? 'login-server-error'
                        : 'login-email-feedback'
                      : undefined
                  }
                  onChange={handleEmailChange}
                  className={`${styles.input} ${
                    emailError ? styles.error : emailValid ? styles.valid : ''
                  }`}
                />

                {emailError && (
                  <Icon
                    name="icon-cross"
                    className={`${styles.crossIcon} ${styles.iconSize}`}
                  />
                )}

                {emailValid && (
                  <Icon
                    name="icon-check"
                    className={`${styles.checkIconAbsolute} ${styles.iconSize}`}
                  />
                )}
              </div>

              {!serverError && emailError && errors.email && (
                <p
                  id="login-email-feedback"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}

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
                    passwordError
                      ? serverError
                        ? 'login-server-error'
                        : 'login-password-feedback'
                      : passwordValid
                        ? 'login-password-feedback'
                        : undefined
                  }
                  onChange={handlePasswordChange}
                  className={`${styles.input} ${
                    passwordError
                      ? styles.error
                      : passwordValid
                        ? styles.valid
                        : ''
                  } ${
                    !showPassword && values.password ? styles.maskedInput : ''
                  }`}
                />

                {!showPassword && values.password && (
                  <span className={styles.stars} aria-hidden="true">
                    {'*'.repeat(values.password.length)}
                  </span>
                )}

                <div className={styles.passwordIcons}>
                  {passwordValid && (
                    <Icon
                      name="icon-check"
                      className={`${styles.checkIcon} ${styles.iconSize}`}
                    />
                  )}

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <LuEye className={styles.iconSize} />
                    ) : (
                      <Icon name="icon-eye-off" className={styles.iconSize} />
                    )}
                  </button>
                </div>
              </div>

              {!serverError && passwordError && errors.password && (
                <p
                  id="login-password-feedback"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.password}
                </p>
              )}

              {passwordValid && (
                <p id="login-password-feedback" className={styles.successText}>
                  Password is secure
                </p>
              )}
            </div>

            {/* Backend error message */}

            {serverError && (
              <p
                id="login-server-error"
                className={styles.errorText}
                role="alert"
              >
                {serverErrorMessage}
              </p>
            )}

            {/* Submit button */}

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
