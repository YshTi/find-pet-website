import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  to?: string;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = `${styles.button} ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
