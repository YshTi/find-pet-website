import Icon from '../Icon/Icon';
import PetInfo from '../PetInfo/PetInfo';
import styles from './PetBlock.module.css';

interface PetInfoData {
  name: string;
  birthday: string;
  description: string;
}

interface PetBlockProps {
  image: string;
  rectangleIcon: string;
  alt: string;
  petInfo?: PetInfoData;
  className?: string;
}

export default function PetBlock({
  image,
  rectangleIcon,
  alt,
  petInfo,
  className = '',
}: PetBlockProps) {
  return (
    <div className={`${styles.petBlock} ${className}`}>
      <div className={styles.imageComposition}>
        <Icon
          name={rectangleIcon}
          className={styles.rectangle}
        />

        <img
          src={image}
          alt={alt}
          className={styles.image}
          width={506}
          height={505}
          decoding="async"
        />
      </div>

      {petInfo && (
        <PetInfo
          name={petInfo.name}
          birthday={petInfo.birthday}
          description={petInfo.description}
          className={styles.petInfo}
        />
      )}
    </div>
  );
}
