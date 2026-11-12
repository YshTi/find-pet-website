import { useState, type FormEvent } from 'react';

import Icon from '../Icon/Icon';

import styles from './SearchField.module.css';

interface SearchFieldProps {
  onSearch: (keyword: string) => void;
  className?: string;
}

export default function SearchField({
  onSearch,
  className = '',
}: SearchFieldProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form
      className={`${styles.searchForm} ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        aria-label="Search news"
        className={styles.input}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          <Icon
            name="icon-cross"
            className={`${styles.clearIcon} clear-icon`}
          />
        </button>
      )}

      <button
        type="submit"
        className={`${styles.searchButton} search-button`}
        aria-label="Search"
      >
        <Icon
          name="icon-search"
          className={`${styles.searchIcon} search-icon`}
        />
      </button>
    </form>
  );
}
