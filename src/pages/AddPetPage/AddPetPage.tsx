import Container from '../../components/Container/Container';
import PetBlock from '../../components/PetBlock/PetBlock';
import AddPetForm from '../../components/AddPetForm/AddPetForm';
import Title from '../../components/Title/Title';

import styles from './AddPetPage.module.css';

export default function AddPetPage() {
  return (
    <Container>
      <section className={styles.page}>
        <PetBlock
          image="/images/dog-add-pet.webp"
          rectangleIcon="icon-rectangle"
          alt="Dog wearing glasses"
          className={styles.addPetBlock}
        />

        <div className={styles.formCard}>
          <div className={styles.heading}>
            <Title className={styles.addPetTitle}>Add my pet /</Title>
            <span className={styles.caption}>Personal details</span>
          </div>

          <AddPetForm />
        </div>
      </section>
    </Container>
  );
}
