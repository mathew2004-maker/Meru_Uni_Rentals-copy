import { useState } from 'react';
import styles from './ImageGallery.module.css';

const API_BASE = 'http://localhost:5000';

function ImageGallery({ images }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={styles.noImage}>
        <span>🏠</span>
        <p>No images uploaded</p>
      </div>
    );
  }

  const imageUrls = images || [];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <img src={imageUrls[current]} alt={`Room view ${current + 1}`} />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {imageUrls.map((url, index) => (
            <button
              key={index}
              className={`${styles.thumb} ${index === current ? styles.active : ''}`}
              onClick={() => setCurrent(index)}
              type="button"
            >
              <img src={url} alt={`Thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;