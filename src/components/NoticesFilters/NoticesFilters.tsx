import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import type { SelectInstance } from 'react-select';

import Dropdown, { type DropdownOption } from '../Dropdown/Dropdown';
import SearchField from '../SearchField/SearchField';
import Icon from '../Icon/Icon';

import { searchLocations } from '../../services/noticesApi';

import type { NoticeFilters, LocationOption } from '../../types/notices';

import styles from './NoticesFilters.module.css';

interface FilterOptions {
  categories: string[];
  sexes: string[];
  species: string[];
}

interface NoticesFiltersProps {
  filters: NoticeFilters;
  options: FilterOptions;
  onChange: (filters: NoticeFilters) => void;
  onReset: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

type LocationSearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface LocationSearchState {
  keyword: string;
  status: LocationSearchStatus;
  results: LocationOption[];
}

const MIN_LOCATION_SEARCH_LENGTH = 3;

const initialLocationSearch: LocationSearchState = {
  keyword: '',
  status: 'idle',
  results: [],
};

const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'unpopular', label: 'Unpopular' },
  { value: 'cheap', label: 'Cheap' },
  { value: 'expensive', label: 'Expensive' },
] as const;

const formatLabel = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default function NoticesFilters({
  filters,
  options,
  onChange,
  onReset,
}: NoticesFiltersProps) {
  const [citySearch, setCitySearch] = useState('');

  const [selectedLocation, setSelectedLocation] = useState<SelectOption | null>(
    null,
  );

  const [locationSearch, setLocationSearch] = useState<LocationSearchState>(
    initialLocationSearch,
  );

  const [searchTrigger, setSearchTrigger] = useState(0);

  const locationSelectRef = useRef<SelectInstance<SelectOption, false>>(null);

  const immediateSearchRef = useRef(false);

  const keyword = citySearch.trim();

  const shouldSearchCities = keyword.length >= MIN_LOCATION_SEARCH_LENGTH;

  const hasActiveFilters =
    filters.keyword.trim() !== '' ||
    filters.category !== '' ||
    filters.sex !== '' ||
    filters.species !== '' ||
    filters.locationId !== '' ||
    filters.sortBy !== '' ||
    citySearch.trim() !== '';

  // Search locations automatically after 300ms,
  // or immediately when the Search button is clicked.
  useEffect(() => {
    if (!shouldSearchCities) return;

    const controller = new AbortController();

    const delay = immediateSearchRef.current ? 0 : 300;
    immediateSearchRef.current = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await searchLocations(keyword, controller.signal);

        if (controller.signal.aborted) return;

        setLocationSearch({
          keyword,
          status: 'success',
          results: data,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to search locations:', error);

        setLocationSearch({
          keyword,
          status: 'error',
          results: [],
        });
      }
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [keyword, shouldSearchCities, searchTrigger]);

  // Update parent filters.
  const updateFilter = <K extends keyof NoticeFilters>(
    key: K,
    value: NoticeFilters[K],
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  // Dropdown options from backend.
  const categoryOptions: DropdownOption[] = [
    { value: '', label: 'Show all' },
    ...options.categories.map((category) => ({
      value: category,
      label: formatLabel(category),
    })),
  ];

  const genderOptions: DropdownOption[] = [
    { value: '', label: 'Show all' },
    ...options.sexes.map((sex) => ({
      value: sex,
      label: formatLabel(sex),
    })),
  ];

  const typeOptions: DropdownOption[] = [
    { value: '', label: 'Show all' },
    ...options.species.map((species) => ({
      value: species,
      label: formatLabel(species),
    })),
  ];

  // Location search state.
  const hasCompletedSearch =
    shouldSearchCities &&
    locationSearch.keyword === keyword &&
    locationSearch.status === 'success';

  const hasSearchError =
    shouldSearchCities &&
    locationSearch.keyword === keyword &&
    locationSearch.status === 'error';

  const isSearching =
    shouldSearchCities && !hasCompletedSearch && !hasSearchError;

  // Display results for the current keyword only.
  const locationOptions: SelectOption[] = hasCompletedSearch
    ? locationSearch.results.map((location) => ({
        value: location._id,
        label: `${location.cityEn}, ${location.stateEn}`,
      }))
    : [];

  // Transparent styling for hints and errors.
  const showLocationHint =
    !shouldSearchCities ||
    hasSearchError ||
    (hasCompletedSearch && locationOptions.length === 0);

  // Handle location typing.
  const handleLocationInput = (value: string) => {
    setCitySearch(value);

    if (value.trim().length < MIN_LOCATION_SEARCH_LENGTH) {
      setLocationSearch(initialLocationSearch);
    } else {
      setLocationSearch({
        keyword: value.trim(),
        status: 'loading',
        results: [],
      });
    }
  };

  // Select a location to filter notices.
  const handleLocationChange = (option: SelectOption | null) => {
    setSelectedLocation(option);
    setCitySearch('');
    setLocationSearch(initialLocationSearch);

    updateFilter('locationId', option?.value ?? '');
  };

  // Clear the typed text and selected location.
  const handleClearLocation = () => {
    setCitySearch('');
    setSelectedLocation(null);
    setLocationSearch(initialLocationSearch);

    if (filters.locationId) {
      updateFilter('locationId', '');
    }

    // Close the menu and restore the placeholder.
    locationSelectRef.current?.blur();
  };

  // Trigger an immediate search.
  const handleSearchLocation = () => {
    locationSelectRef.current?.focus();

    if (!shouldSearchCities) return;

    setLocationSearch({
      keyword,
      status: 'loading',
      results: [],
    });

    immediateSearchRef.current = true;

    setSearchTrigger((previous) => previous + 1);
  };

  // Reset all filters.
  const handleReset = () => {
    setCitySearch('');
    setSelectedLocation(null);
    setLocationSearch(initialLocationSearch);

    locationSelectRef.current?.blur();

    onReset();
  };

  return (
    <section className={styles.filters} aria-label="Notice filters">
      <div className={styles.fields}>
        {/* PET SEARCH */}

        <SearchField
          className={styles.searchPet}
          key={filters.keyword}
          onSearch={(value) => updateFilter('keyword', value)}
        />

        {/* CATEGORY + GENDER */}

        <div className={styles.twoFilters}>
          <Dropdown
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => updateFilter('category', value)}
            placeholder="Category"
            className={styles.filterDropdown}
            triggerClassName={styles.filterTrigger}
            menuClassName={styles.filterMenu}
            chevronClassName={styles.filterChevron}
          />

          <Dropdown
            options={genderOptions}
            value={filters.sex}
            onChange={(value) => updateFilter('sex', value)}
            placeholder="By gender"
            className={styles.filterDropdown}
            triggerClassName={styles.filterTrigger}
            menuClassName={styles.filterMenu}
            chevronClassName={styles.filterChevron}
          />
        </div>

        {/* PET TYPE */}

        <Dropdown
          options={typeOptions}
          value={filters.species}
          onChange={(value) => updateFilter('species', value)}
          placeholder="By type"
          className={styles.filterDropdown}
          triggerClassName={styles.filterTrigger}
          menuClassName={`${styles.filterMenu} ${styles.typeMenu}`}
          chevronClassName={styles.filterChevron}
        />

        {/* LOCATION SEARCH */}

        <div className={styles.locationField}>
          <Select<SelectOption, false>
            ref={locationSelectRef}
            className={`${styles.locationSelect} ${
              showLocationHint ? styles.locationHint : ''
            }`}
            classNamePrefix="location"
            options={locationOptions}
            value={selectedLocation}
            inputValue={citySearch}
            onInputChange={(value, action) => {
              if (action.action === 'input-change') {
                handleLocationInput(value);
              }
            }}
            onChange={handleLocationChange}
            placeholder="Location"
            isSearchable
            isClearable={false}
            isLoading={isSearching}
            filterOption={() => true}
            noOptionsMessage={() => {
              if (!shouldSearchCities) {
                return `Enter at least ${MIN_LOCATION_SEARCH_LENGTH} characters`;
              }

              if (hasSearchError) {
                return 'Failed to load locations';
              }

              return 'No locations found';
            }}
            loadingMessage={() => 'Searching locations...'}
            components={{
              DropdownIndicator: null,
              IndicatorSeparator: null,
              LoadingIndicator: () => null,
            }}
            aria-label="Location"
          />

          <div className={styles.locationActions}>
            {(citySearch || selectedLocation) && (
              <button
                type="button"
                className={styles.locationClearButton}
                onClick={handleClearLocation}
                aria-label="Clear location"
              >
                <Icon name="icon-cross" className={styles.locationClearIcon} />
              </button>
            )}

            <button
              type="button"
              className={styles.locationSearchButton}
              onClick={handleSearchLocation}
              aria-label="Search locations"
            >
              <Icon name="icon-search" className={styles.locationSearchIcon} />
            </button>
          </div>
        </div>
      </div>

      {/* SORT OPTIONS */}

      <div className={styles.sortOptions}>
        {sortOptions.map((option) => {
          const isActive = filters.sortBy === option.value;

          return (
            <label
              key={option.value}
              className={styles.radioLabel}
              onClick={(event) => {
                if (isActive) {
                  event.preventDefault();
                  updateFilter('sortBy', '');
                }
              }}
            >
              <input
                type="radio"
                name="noticeSort"
                value={option.value}
                checked={isActive}
                onChange={() => updateFilter('sortBy', option.value)}
                className={styles.radio}
              />

              <span className={styles.radioContent}>
                {option.label}

                {isActive && (
                  <Icon name="icon-cross" className={styles.radioCross} />
                )}
              </span>
            </label>
          );
        })}

        {/* RESET */}

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}
