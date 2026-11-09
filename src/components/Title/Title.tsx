import type { ReactNode } from 'react';
import styles from './Title.module.css';

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export default function Title({ children, className = '' }: TitleProps) {
  return <h2 className={`${styles.title} ${className}`}>{children}</h2>;
}
