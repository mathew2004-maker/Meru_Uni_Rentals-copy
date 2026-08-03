import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>🏠 Comrades Rentals — Built for Meru University students</p>
        <p className={styles.sub}>No accounts. No fees. Just find a room and call.</p>
      </div>
    </footer>
  );
}

export default Footer;
