import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery/ImageGallery';
import styles from './RoomDetailPage.module.css';

const API_BASE = 'http://localhost:5000';

function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/rooms/${id}`);
      setRoom(res.data);
    } catch (err) {
      console.error('Failed to fetch room:', err);
      navigate('/not-found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const isOwner =
    user &&
    room &&
    (room.postedBy?._id === user.id || room.postedBy === user.id);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading room details...</p>
      </div>
    );
  }

  if (!room) return null;

  const postedDate = new Date(room.createdAt).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>
          ← Back to listings
        </Link>

        <div className={styles.layout}>
          <div className={styles.gallerySection}>
            <ImageGallery images={room.images} />
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.header}>
              <span className={styles.typeBadge}>{room.roomType}</span>
              <h1 className={styles.title}>{room.title}</h1>
              <p className={styles.location}>📍 {room.location}</p>
            </div>

            <div className={styles.priceBox}>
              <span className={styles.price}>KES {room.price.toLocaleString()}</span>
              <span className={styles.perMonth}>per month</span>
            </div>

            <div className={styles.section}>
              <h3>Description</h3>
              <p className={styles.description}>{room.description}</p>
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div className={styles.section}>
                <h3>Amenities</h3>
                <div className={styles.amenities}>
                  {room.amenities.map((amenity, i) => (
                    <span key={i} className={styles.amenityTag}>
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className={styles.contactCard}>
              <h3>Interested?</h3>
              <p>Call the number below to arrange a physical viewing.</p>

              <a href={`tel:${room.landlordPhone}`} className={styles.callBtn}>
                📞 Call Landlord {room.landlordPhone}
              </a>

              {room.caretakerPhone && (
                <a
                  href={`tel:${room.caretakerPhone}`}
                  className={styles.callBtn}
                  style={{ marginTop: 10, background: 'rgba(255,255,255,0.15)', color: 'white' }}
                >
                  📞 Call Caretaker {room.caretakerPhone}
                </a>
              )}
            </div>

            <div className={styles.meta}>
              <span>Listed on {postedDate}</span>
              <span
                className={`${styles.status} ${
                  room.available ? styles.available : styles.unavailable
                }`}
              >
                {room.available ? '● Available' : '● Rented'}
              </span>
            </div>

            {isOwner && (
              <div className={styles.ownerActions}>
                <Link to={`/edit-room/${room._id}`} className={styles.editBtn}>
                  ✎ Edit Listing
                </Link>
                <button onClick={handleDelete} className={styles.deleteBtn}>
                  🗑 Delete this listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;