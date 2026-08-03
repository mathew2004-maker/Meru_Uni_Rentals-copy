import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoIcon}>🏠</span>
          <span>Comrades Rentals</span>
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            onClick={closeMenu}
          >
            Browse Rooms
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/post-room"
                className={`${styles.navLink} ${isActive('/post-room') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                Post a Room
              </Link>
              <span className={styles.userName}>👤 {user?.username}</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${styles.navLink} ${isActive('/login') ? styles.active : ''}`}
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link to="/register" className={styles.postBtn} onClick={closeMenu}>
                Post a Room
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {menuOpen && <div className={styles.backdrop} onClick={closeMenu} />}
    </nav>
  );
}

export default Navbar;