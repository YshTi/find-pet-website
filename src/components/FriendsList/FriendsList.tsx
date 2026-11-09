import type { Friend } from '../../types/friends';

import FriendsItem from '../FriendsItem/FriendsItem';

import styles from './FriendsList.module.css';

interface FriendsListProps {
  friends: Friend[];
}

export default function FriendsList({
  friends,
}: FriendsListProps) {
  return (
    <ul className={styles.list}>
      {friends.map(friend => (
        <li key={friend._id} className={styles.item}>
          <FriendsItem friend={friend} />
        </li>
      ))}
    </ul>
  );
}
