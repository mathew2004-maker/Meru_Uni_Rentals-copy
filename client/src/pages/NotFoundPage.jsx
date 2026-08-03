import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2>Page Not Found</h2>
        <p>The room you are looking for does not exist or has been removed.</p>
        <Link to="/" className={styles.homeBtn}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;