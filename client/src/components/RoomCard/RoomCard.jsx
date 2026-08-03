import { Link } from 'react-router-dom';
import styles from './RoomCard.module.css';

function RoomCard({ room }) {
  const imageUrl =
    room.images.length > 0
      ? room.images[0]
      : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Link to={`/rooms/${room._id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={imageUrl} alt={room.title} className={styles.image} loading="lazy" />
        <span className={styles.badge}>{room.roomType}</span>
        {room.images.length > 1 && (
          <span className={styles.photoCount}>📷 {room.images.length}</span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{room.title}</h3>
        <p className={styles.location}>📍 {room.location}</p>
        <div className={styles.footer}>
          <span className={styles.price}>
            KES {room.price.toLocaleString()}
            <span className={styles.perMonth}>/mo</span>
          </span>
          <span className={styles.phone}>📞 {room.landlordPhone}</span>
        </div>
      </div>
    </Link>
  );
}

export default RoomCard;