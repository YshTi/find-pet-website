import { useEffect, useState } from 'react';

import Container from '../../components/Container/Container';
import Title from '../../components/Title/Title';
import FriendsList from '../../components/FriendsList/FriendsList';
import { getFriends } from '../../services/friendsApi';
import type { Friend } from '../../types/friends';

import styles from './FriendsPage.module.css';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadFriends = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getFriends(controller.signal);

        if (controller.signal.aborted) return;

        setFriends(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('Failed to fetch friends:', error);

        setError('Failed to load partners.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadFriends();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className={styles.friendsPage}>
      <Container>
        <Title className={styles.friendsTitle}>Our friends</Title>

        {isLoading && <p>Loading partners...</p>}

        {error && <p role="alert">{error}</p>}

        {!isLoading &&
          !error &&
          (friends.length > 0 ? (
            <FriendsList friends={friends} />
          ) : (
            <p>No partners found.</p>
          ))}
      </Container>
    </main>
  );
}
