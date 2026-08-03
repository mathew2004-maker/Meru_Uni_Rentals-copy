import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoomForm from '../components/RoomForm/RoomForm';
import styles from './PostRoomPage.module.css';

function PostRoomPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Post a Vacant Room</h1>
          <p>
            Have / known of a vacant room available near Meru University? Fill in the details below
            and help comrades out.
          </p>
        </div>

        <div className={styles.card}>
          <RoomForm />
        </div>
      </div>
    </div>
  );
}

export default PostRoomPage;