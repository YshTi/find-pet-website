import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { LuEye, LuCheck } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';

import Icon from '../Icon/Icon';
import Button from '../Button/Button';

import { useAppDispatch } from '../../redux/hooks';
import { setCredentials } from '../../redux/auth/authSlice';
import { registerUser } from '../../services/authApi';
import { api } from '../../services/api';

import styles from './RegistrationForm.module.css';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: FormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const emailRegex =
  /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Name is required'),

  email: Yup.string()
    .matches(emailRegex, 'Enter a valid Email')
    .required('Email is required'),

  password: Yup.string()
    .min(7, 'Password must contain at least 7 characters')
    .required('Password is required'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

type PasswordFieldName = 'password' | 'confirmPassword';

interface PasswordInputProps {
  name: PasswordFieldName;
  placeholder: string;
  value: string;
  hasError: boolean;
  isValid: boolean;
  error?: string;
  showPassword: boolean;
  onToggle: () => void;
}

function PasswordInput({
  name,
  placeholder,
  value,
  hasError,
  isValid,
  error,
  showPassword,
  onToggle,
}: PasswordInputProps) {
  const feedbackId = `${name}-feedback`;

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.passwordWrapper}>
        <Field
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete="new-password"
          aria-label={placeholder}
          aria-invalid={hasError}
          aria-describedby={
            hasError || isValid ? feedbackId : undefined
          }
          className={`${styles.input} ${
            hasError
              ? styles.error
              : isValid
                ? styles.valid
                : ''
          } ${
            !showPassword && value ? styles.maskedInput : ''
          }`}
        />

        {!showPassword && value && (
          <span
            className={styles.stars}
            aria-hidden="true"
          >
            {'*'.repeat(value.length)}
          </span>
        )}

        <div className={styles.passwordIcons}>
          {isValid && (
            <LuCheck
              className={`${styles.checkIcon} ${styles.iconSize}`}
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            className={styles.eyeButton}
            onClick={onToggle}
            aria-label={
              showPassword
                ? `Hide ${placeholder.toLowerCase()}`
                : `Show ${placeholder.toLowerCase()}`
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

      {hasError && (
        <p
          id={feedbackId}
          className={styles.errorText}
          role="alert"
        >
          {error}
        </p>
      )}

      {isValid && (
        <p
          id={feedbackId}
          className={styles.successText}
        >
          {name === 'password'
            ? 'Password is secure'
            : 'Passwords match'}
        </p>
      )}
    </div>
  );
}

export default function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues) => {
    const { name, email, password } = values;

    try {
      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!response.token || !response.user) {
        toast.error('Unexpected registration response');
        return;
      }

      // Add token to future requests.
      api.defaults.headers.common.Authorization =
        `Bearer ${response.token}`;

      // Save authentication information in Redux.
      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
        }),
      );

      toast.success('Registration successful!');

      navigate('/profile', { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        const message =
          typeof apiMessage === 'string'
            ? apiMessage
            : error.response?.status === 409
              ? 'An account with this email already exists'
              : 'Registration failed. Please try again.';

        toast.error(message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
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
      }) => {
        const nameError = Boolean(
          (touched.name || submitCount > 0) && errors.name,
        );

        const emailError = Boolean(
          (touched.email || submitCount > 0) && errors.email,
        );

        const passwordError = Boolean(
          (touched.password || submitCount > 0) &&
          errors.password,
        );

        const confirmPasswordError = Boolean(
          (touched.confirmPassword || submitCount > 0) &&
          errors.confirmPassword,
        );

        const nameValid = Boolean(
          touched.name && values.name && !errors.name,
        );

        const emailValid = Boolean(
          touched.email && values.email && !errors.email,
        );

        const passwordValid = Boolean(
          touched.password && values.password && !errors.password,
        );

        const confirmPasswordValid = Boolean(
          touched.confirmPassword &&
          values.confirmPassword &&
          !errors.confirmPassword,
        );

        return (
          <Form className={styles.form} noValidate>
            <div className={styles.fieldGroup}>
              <div className={styles.inputWrapper}>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Name"
                  autoComplete="name"
                  aria-label="Name"
                  aria-invalid={nameError}
                  aria-describedby={
                    nameError ? 'name-feedback' : undefined
                  }
                  className={`${styles.input} ${
                    nameError
                      ? styles.error
                      : nameValid
                        ? styles.valid
                        : ''
                  }`}
                />

                {nameError && (
                  <Icon
                    name="icon-cross"
                    className={`${styles.crossIcon} ${styles.iconSize}`}
                  />
                )}

                {nameValid && (
                  <LuCheck
                    className={`${styles.checkIconAbsolute} ${styles.iconSize}`}
                    aria-hidden="true"
                  />
                )}
              </div>

              {nameError && (
                <p
                  id="name-feedback"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.inputWrapper}>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  aria-label="Email"
                  aria-invalid={emailError}
                  aria-describedby={
                    emailError ? 'email-feedback' : undefined
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
                  id="email-feedback"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <PasswordInput
              name="password"
              placeholder="Password"
              value={values.password}
              hasError={passwordError}
              isValid={passwordValid}
              error={errors.password}
              showPassword={showPassword}
              onToggle={() =>
                setShowPassword((previous) => !previous)
              }
            />

            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm password"
              value={values.confirmPassword}
              hasError={confirmPasswordError}
              isValid={confirmPasswordValid}
              error={errors.confirmPassword}
              showPassword={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword((previous) => !previous)
              }
            />

            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Registering...'
                : 'Registration'}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
