import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import Icon from '../Icon/Icon';
import styles from './Dropdown.module.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  valid?: boolean;
}

const MIN_THUMB_HEIGHT = 61;

export default function Dropdown({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select',
  className = '',
  disabled = false,
  invalid = false,
  valid = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(61);
  const [thumbTop, setThumbTop] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    startY: number;
    startScrollTop: number;
  } | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const triggerClassName = [
    styles.trigger,
    isOpen && styles.open,
    invalid && styles.invalid,
    valid && !invalid && styles.valid,
  ]
    .filter(Boolean)
    .join(' ');

  const updateScrollbar = useCallback(() => {
    const scrollArea = scrollRef.current;
    const track = trackRef.current;

    if (!scrollArea || !track) return;

    const { scrollHeight, clientHeight, scrollTop } = scrollArea;
    const trackHeight = track.clientHeight;

    const maxScroll = scrollHeight - clientHeight;
    const scrollable = maxScroll > 1 && trackHeight > 0;

    setCanScroll(scrollable);

    if (!scrollable) {
      setThumbHeight(trackHeight);
      setThumbTop(0);
      return;
    }

    const calculatedHeight = (clientHeight / scrollHeight) * trackHeight;

    const nextThumbHeight = Math.min(
      trackHeight,
      Math.max(MIN_THUMB_HEIGHT, calculatedHeight),
    );

    const maxThumbTravel = trackHeight - nextThumbHeight;

    const nextThumbTop =
      maxThumbTravel > 0 ? (scrollTop / maxScroll) * maxThumbTravel : 0;

    setThumbHeight(nextThumbHeight);
    setThumbTop(nextThumbTop);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const scrollArea = scrollRef.current;
    const track = trackRef.current;

    if (!scrollArea || !track) return;

    updateScrollbar();

    const observer = new ResizeObserver(updateScrollbar);

    observer.observe(scrollArea);
    observer.observe(track);

    return () => observer.disconnect();
  }, [isOpen, options, updateScrollbar]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);

    // Mark the field as touched only when no option was selected.
    if (!value) {
      onBlur?.();
    }
  }, [value, onBlur]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeDropdown]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scrollArea = scrollRef.current;

    if (!scrollArea || !canScroll) return;

    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      startY: event.clientY,
      startScrollTop: scrollArea.scrollTop,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scrollArea = scrollRef.current;
    const track = trackRef.current;
    const drag = dragRef.current;

    if (!scrollArea || !track || !drag) return;

    const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;

    const maxThumbTravel = track.clientHeight - thumbHeight;

    if (maxScroll <= 0 || maxThumbTravel <= 0) return;

    const deltaY = event.clientY - drag.startY;

    scrollArea.scrollTop =
      drag.startScrollTop + (deltaY / maxThumbTravel) * maxScroll;
  };

  const handleThumbPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canScroll || event.target !== event.currentTarget) {
      return;
    }

    const scrollArea = scrollRef.current;
    const track = trackRef.current;

    if (!scrollArea || !track) return;

    const rect = track.getBoundingClientRect();
    const clickedY = event.clientY - rect.top;

    const maxThumbTravel = track.clientHeight - thumbHeight;

    const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;

    if (maxThumbTravel <= 0 || maxScroll <= 0) return;

    const desiredTop = Math.max(
      0,
      Math.min(clickedY - thumbHeight / 2, maxThumbTravel),
    );

    scrollArea.scrollTop = (desiredTop / maxThumbTravel) * maxScroll;
  };

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleTriggerClick = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={`${styles.dropdown} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-invalid={invalid}
        disabled={disabled}
      >
        <span className={styles.selected}>
          {selectedOption?.label || placeholder}
        </span>

        <Icon
          name="icon-chevron-down"
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div
            ref={scrollRef}
            className={styles.scrollArea}
            onScroll={updateScrollbar}
          >
            {options.length === 0 ? (
              <p className={styles.empty}>No options available</p>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.option} ${
                    value === option.value ? styles.activeOption : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>

          <div
            ref={trackRef}
            className={styles.scrollbarTrack}
            style={{
              visibility: canScroll ? 'visible' : 'hidden',
            }}
            onPointerDown={handleTrackPointerDown}
            aria-hidden="true"
          >
            {canScroll && (
              <div
                className={styles.scrollbarThumb}
                style={{
                  height: `${thumbHeight}px`,
                  transform: `translateY(${thumbTop}px)`,
                }}
                onPointerDown={handleThumbPointerDown}
                onPointerMove={handleThumbPointerMove}
                onPointerUp={handleThumbPointerUp}
                onPointerCancel={handleThumbPointerUp}
                onLostPointerCapture={() => {
                  dragRef.current = null;
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
