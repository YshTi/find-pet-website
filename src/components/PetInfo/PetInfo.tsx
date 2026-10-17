import styles from './PetInfo.module.css';

interface PetInfoProps {
  name: string;
  birthday: string;
  description: string;
  avatar: string;
  className?: string;
}

export default function PetInfo({
  name,
  birthday,
  description,
  avatar,
  className = '',
}: PetInfoProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.avatar}>
        <img
          src={avatar}
          alt=""
          className={styles.avatarImage}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{name}</span>

          <span className={styles.birthday}>
            Birthday: <span>{birthday}</span>
          </span>
        </div>

        <p className={styles.description}>
          {description}
        </p>
      </div>
    </div>
  );
}
