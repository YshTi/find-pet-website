
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

import Icon from '../Icon/Icon';
import Button from '../Button/Button';
import Dropdown, {
  type DropdownOption,
} from '../Dropdown/Dropdown';
import { getSpecies } from '../../services/speciesApi';

import styles from './AddPetForm.module.css';

interface AddPetValues {
  sex: string;
  imgUrl: string;
  title: string;
  name: string;
  birthday: string;
  species: string;
  customSpecies: string;
}

const initialValues: AddPetValues = {
  sex: '',
  imgUrl: '',
  title: '',
  name: '',
  birthday: '',
  species: '',
  customSpecies: '',
};

const imageRegex =
  /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/i;

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

const formatBirthday = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return (
    `${digits.slice(0, 2)}.` +
    `${digits.slice(2, 4)}.` +
    digits.slice(4)
  );
};

const convertBirthdayToApi = (birthday: string): string => {
  const [day, month, year] = birthday.split('.');
  return `${year}-${month}-${day}`;
};

const convertBirthdayFromApi = (birthday: string): string => {
  const [year, month, day] = birthday.split('-');
  return `${day}.${month}.${year}`;
};

const isValidBirthday = (value: string): boolean => {
  if (!dateRegex.test(value)) {
    return false;
  }

  const [day, month, year] = value.split('.').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getTime() <= Date.now() &&
    year >= 1900
  );
};

const validationSchema = Yup.object({
  sex: Yup.string().required('Select a gender'),

  imgUrl: Yup.string()
    .matches(imageRegex, 'Enter a valid image URL')
    .required('Image URL is required'),

  title: Yup.string()
    .trim()
    .required('Title is required'),

  name: Yup.string()
    .trim()
    .required("Pet's name is required"),

  birthday: Yup.string()
    .required('Birthday is required')
    .matches(dateRegex, 'Use DD.MM.YYYY format')
    .test(
      'real-date',
      'Enter a valid birthday',
      (value) => !value || !dateRegex.test(value) ||
        isValidBirthday(value),
    ),

  species: Yup.string().required('Choose a pet type'),

  customSpecies: Yup.string().when('species', {
    is: 'other',
    then: (schema) =>
      schema
        .trim()
        .min(2, 'Enter at least 2 characters')
        .max(50, 'Maximum 50 characters')
        .required('Enter your pet species'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const genderOptions = [
  { value: 'female', icon: 'icon-female' },
  { value: 'male', icon: 'icon-male' },
  { value: 'multiple', icon: 'icon-genders' },
];

export default function AddPetForm() {
  const navigate = useNavigate();

  const calendarRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  const [speciesOptions, setSpeciesOptions] = useState<
    DropdownOption[]
  >([]);

  const [speciesLoading, setSpeciesLoading] = useState(true);
  const [speciesError, setSpeciesError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSpecies() {
      try {
        const options = await getSpecies();

        if (!active) return;

        setSpeciesOptions([
          ...options.filter(
            (option) => option.value.toLowerCase() !== 'other',
          ),
          { value: 'other', label: 'Other' },
        ]);

        setSpeciesError(false);
      } catch {
        if (!active) return;

        setSpeciesOptions([
          { value: 'other', label: 'Other' },
        ]);

        setSpeciesError(true);
        toast.error('Failed to load pet species');
      } finally {
        if (active) {
          setSpeciesLoading(false);
        }
      }
    }

    void loadSpecies();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = (values: AddPetValues) => {
    const { customSpecies, ...petData } = values;

    const finalSpecies =
      values.species === 'other'
        ? customSpecies.trim().toLowerCase()
        : values.species;

    const payload = {
      ...petData,
      birthday: convertBirthdayToApi(values.birthday),
      species: finalSpecies,
    };

    // Connect the pet-creation API here.
    // The backend must support custom species before
    // submitting values entered through "Other".

    void payload;

    toast('Form validated. Backend connection is not set up yet.');
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
        setFieldValue,
        setFieldTouched,
        setValues,
        validateForm,
        isSubmitting,
      }) => {
        const isInvalid = (name: keyof AddPetValues) =>
          Boolean(errors[name]) &&
          (Boolean(touched[name]) || submitCount > 0);

        const isValid = (name: keyof AddPetValues) =>
          Boolean(values[name]) &&
          !errors[name] &&
          (Boolean(touched[name]) || submitCount > 0);

        const fieldClass = (name: keyof AddPetValues) =>
          `${styles.input} ${
            isInvalid(name)
              ? styles.error
              : isValid(name)
                ? styles.valid
                : ''
          }`;

        const imageValid =
          Boolean(values.imgUrl) &&
          imageRegex.test(values.imgUrl);

        const showPreview =
          imageValid &&
          previewUrl === values.imgUrl &&
          !previewError;

        const handlePreview = async () => {
          await setFieldTouched('imgUrl', true);

          if (!imageValid) {
            setPreviewUrl('');
            setPreviewError(false);
            toast.error('Enter a valid image URL');
            return;
          }

          setPreviewError(false);
          setPreviewUrl(values.imgUrl);
        };

        const handleInvalidSubmit = async () => {
          const validationErrors = await validateForm();

          const firstError = Object.values(validationErrors)[0];

          if (firstError) {
            toast.error(String(firstError));
          }
        };

        const handleCalendarClick = () => {
          const dateInput = calendarRef.current;

          if (!dateInput) return;

          if (typeof dateInput.showPicker === 'function') {
            dateInput.showPicker();
          } else {
            dateInput.focus();
            dateInput.click();
          }
        };

        return (
          <Form className={styles.form} noValidate>
            <div className={styles.genderField}>
              <fieldset className={styles.genderGroup}>
                <legend className={styles.visuallyHidden}>
                  Pet gender
                </legend>

                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.genderLabel} ${
                      styles[option.value]
                    } ${
                      values.sex === option.value
                        ? styles.selected
                        : ''
                    }`}
                  >
                    <Field
                      type="radio"
                      name="sex"
                      value={option.value}
                      className={styles.visuallyHidden}
                      aria-invalid={isInvalid('sex')}
                      aria-describedby={
                        isInvalid('sex')
                          ? 'sex-error'
                          : undefined
                      }
                    />

                    <Icon
                      name={option.icon}
                      className={styles.genderIcon}
                    />

                    <span className={styles.visuallyHidden}>
                      {option.value}
                    </span>
                  </label>
                ))}
              </fieldset>

              {isInvalid('sex') && (
                <p
                  id="sex-error"
                  className={styles.genderErrorText}
                  role="alert"
                >
                  {errors.sex}
                </p>
              )}
            </div>

            <div className={styles.photoPreview}>
              {showPreview ? (
                <img
                  src={previewUrl}
                  alt="Pet preview"
                  className={styles.previewImage}
                  onError={() => {
                    setPreviewError(true);
                    toast.error('Could not load the image');
                  }}
                />
              ) : (
                <Icon
                  name="icon-paw"
                  className={styles.pawIcon}
                />
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.urlRow}>
                <div className={styles.urlField}>
                  <Field
                    name="imgUrl"
                    type="url"
                    placeholder="Enter URL"
                    aria-label="Pet image URL"
                    aria-invalid={isInvalid('imgUrl')}
                    aria-describedby={
                      isInvalid('imgUrl')
                        ? 'imgUrl-error'
                        : undefined
                    }
                    className={`${fieldClass('imgUrl')} ${styles.urlInput}`}
                    onChange={(
                      event: ChangeEvent<HTMLInputElement>,
                    ) => {
                      void setFieldValue(
                        'imgUrl',
                        event.target.value,
                      );

                      setPreviewUrl('');
                      setPreviewError(false);
                    }}
                  />
                </div>

                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => {
                    void handlePreview();
                  }}
                >
                  Upload photo
                  <Icon
                    name="icon-upload-cloud"
                    className={styles.uploadIcon}
                  />
                </button>
              </div>

              {isInvalid('imgUrl') && (
                <p
                  id="imgUrl-error"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.imgUrl}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <Field
                name="title"
                type="text"
                placeholder="Title"
                aria-label="Title"
                aria-invalid={isInvalid('title')}
                aria-describedby={
                  isInvalid('title')
                    ? 'title-error'
                    : undefined
                }
                className={fieldClass('title')}
              />

              {isInvalid('title') && (
                <p
                  id="title-error"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.title}
                </p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <Field
                name="name"
                type="text"
                placeholder="Pet's Name"
                aria-label="Pet's name"
                aria-invalid={isInvalid('name')}
                aria-describedby={
                  isInvalid('name')
                    ? 'name-error'
                    : undefined
                }
                className={fieldClass('name')}
              />

              {isInvalid('name') && (
                <p
                  id="name-error"
                  className={styles.errorText}
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.detailsRow}>
              <div className={styles.dateField}>
                <Field
                  name="birthday"
                  type="text"
                  inputMode="numeric"
                  placeholder="00.00.0000"
                  maxLength={10}
                  aria-label="Birthday"
                  aria-invalid={isInvalid('birthday')}
                  aria-describedby={
                    isInvalid('birthday')
                      ? 'birthday-error'
                      : undefined
                  }
                  className={`${fieldClass('birthday')} ${styles.dateInput}`}
                  onChange={(
                    event: ChangeEvent<HTMLInputElement>,
                  ) => {
                    void setFieldValue(
                      'birthday',
                      formatBirthday(event.target.value),
                    );
                  }}
                />

                <input
                  ref={calendarRef}
                  type="date"
                  className={styles.nativeDatePicker}
                  tabIndex={-1}
                  aria-label="Choose birthday from calendar"
                  value={
                    isValidBirthday(values.birthday)
                      ? convertBirthdayToApi(values.birthday)
                      : ''
                  }
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => {
                    if (event.target.value) {
                      void setFieldValue(
                        'birthday',
                        convertBirthdayFromApi(
                          event.target.value,
                        ),
                      );

                      void setFieldTouched(
                        'birthday',
                        true,
                        false,
                      );
                    }
                  }}
                />

                <button
                  type="button"
                  className={styles.calendarButton}
                  onClick={handleCalendarClick}
                  aria-label="Open birthday calendar"
                >
                  <Icon
                    name="icon-calendar"
                    className={styles.calendarIcon}
                  />
                </button>

                {isInvalid('birthday') && (
                  <p
                    id="birthday-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.birthday}
                  </p>
                )}
              </div>

              <div className={styles.speciesField}>
                <Dropdown
                  options={speciesOptions}
                  value={values.species}
                  onChange={(selectedValue) => {
                    void setValues(
                      {
                        ...values,
                        species: selectedValue,
                        customSpecies: '',
                      },
                      true,
                    );

                    void setFieldTouched('species', true, false);
                  }}
                  onBlur={() => {
                    void setFieldTouched('species', true, true);
                  }}
                  placeholder={
                    speciesLoading ? 'Loading...' : 'Type of pet'
                  }
                  disabled={speciesLoading}
                  invalid={!values.species && isInvalid('species')}
                  valid={Boolean(values.species) && !errors.species}
                />

                {!values.species && isInvalid('species') && (
                  <p
                    id="species-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.species}
                  </p>
                )}
              </div>
            </div>

            {values.species === 'other' && (
              <div className={styles.fieldGroup}>
                <Field
                  name="customSpecies"
                  type="text"
                  placeholder="Enter your pet species"
                  aria-label="Custom pet species"
                  aria-invalid={isInvalid('customSpecies')}
                  aria-describedby={
                    isInvalid('customSpecies')
                      ? 'customSpecies-error'
                      : undefined
                  }
                  className={fieldClass('customSpecies')}
                />

                {isInvalid('customSpecies') && (
                  <p
                    id="customSpecies-error"
                    className={styles.errorText}
                    role="alert"
                  >
                    {errors.customSpecies}
                  </p>
                )}
              </div>
            )}

            {speciesError && (
              <p className={styles.errorText}>
                Could not load predefined pet types.
                You can choose Other and enter a species.
              </p>
            )}

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                className={styles.backButton}
                onClick={() => navigate('/profile')}
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
                disabled={isSubmitting}
                onClick={() => {
                  void handleInvalidSubmit();
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
