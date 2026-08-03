import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RoomForm from '../components/RoomForm/RoomForm';
import styles from './EditRoomPage.module.css';

function EditRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        const roomData = res.data;
        const ownerId = roomData.postedBy?._id || roomData.postedBy;

        if (!user || ownerId !== user.id) {
          navigate(`/rooms/${id}`);
          return;
        }

        setRoom(roomData);
      } catch (err) {
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      navigate('/login');
      return;
    }

    fetchRoom();
  }, [id, user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Edit Your Listing</h1>
          <p>Update the details of your room below.</p>
        </div>
        <div className={styles.card}>
          <RoomForm mode="edit" room={room} />
        </div>
      </div>
    </div>
  );
}

export default EditRoomPage;