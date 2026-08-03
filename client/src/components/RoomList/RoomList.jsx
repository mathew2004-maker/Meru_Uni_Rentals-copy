import RoomCard from '../RoomCard/RoomCard';
import styles from './RoomList.module.css';

function RoomList({ rooms }) {
  if (rooms.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>No rooms found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
}

export default RoomList;