import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import styles from './RoomForm.module.css';

const ROOM_TYPES = [
  'Single Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  'Self-Contained',
];

const AMENITY_OPTIONS = [
  'Water',
  'Electricity',
  'WiFi',
  'Security',
  'Parking',
  'Furnished',
  'Kitchen',
  'Hot Shower',
];

const LOCATIONS = [
  'Runda',
  'California',
  'Kianjai',
  'Cedar',
  'Kiridine',
  'Mascan',
  'Nchiru Market',
  'Kan',
  'Aina',
  'Kunene',
];

function RoomForm({ mode = 'create', room = null }) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState({
    title: room?.title || '',
    description: room?.description || '',
    price: room?.price || '',
    location: room?.location || '',
    roomType: room?.roomType || 'Single Room',
    landlordPhone: room?.landlordPhone || '',
    caretakerPhone: room?.caretakerPhone || '',
    available: room?.available ?? true,
  });

  const [selectedAmenities, setSelectedAmenities] = useState(room?.amenities || []);
  const [existingImages, setExistingImages] = useState(room?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 8 - existingImages.length - newImages.length;

    if (files.length > remainingSlots) {
      alert(`You can only have 8 images total. ${remainingSlots} slot(s) remaining.`);
      return;
    }

    const newFiles = files.slice(0, remainingSlots);
    setNewImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImages.length === 0) {
      alert('Please upload at least one photo of the room.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append('amenities', selectedAmenities.join(', '));

    if (isEdit) {
      existingImages.forEach((url) => data.append('existingImages', url));
    }

    newImages.forEach((img) => {
      data.append('images', img);
    });

    try {
      if (isEdit) {
        await api.put(`/rooms/${room._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate(`/rooms/${room._id}`);
      } else {
        await api.post('/rooms', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate('/');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Room Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Spacious Single Room near Main Gate"
          required
          maxLength={120}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="price">Monthly Rent (KES) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 4500"
            required
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="roomType">Room Type *</label>
          <select id="roomType" name="roomType" value={formData.roomType} onChange={handleChange} required>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="location">Location / Area *</label>
        <select
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select area near Meru University</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="landlordPhone">Landlord Contact *</label>
          <input
            type="tel"
            id="landlordPhone"
            name="landlordPhone"
            value={formData.landlordPhone}
            onChange={handleChange}
            placeholder="e.g., 0712345678"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="caretakerPhone">Caretaker Contact</label>
          <input
            type="tel"
            id="caretakerPhone"
            name="caretakerPhone"
            value={formData.caretakerPhone}
            onChange={handleChange}
            placeholder="e.g., 0798765432"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the room, surroundings, rules, etc."
          required
          rows={5}
          maxLength={2000}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Amenities Available</label>
        <div className={styles.amenitiesGrid}>
          {AMENITY_OPTIONS.map((amenity) => (
            <button
              key={amenity}
              type="button"
              className={`${styles.amenityChip} ${
                selectedAmenities.includes(amenity) ? styles.amenityActive : ''
              }`}
              onClick={() => toggleAmenity(amenity)}
            >
              {selectedAmenities.includes(amenity) ? '✓ ' : '+ '}
              {amenity}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Room Photos * (max 8)</label>
        <div className={styles.uploadArea}>
          <input
            type="file"
            id="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            disabled={existingImages.length + newImages.length >= 8}
          />
          <label htmlFor="images" className={styles.uploadLabel}>
            <span>📷</span>
            <p>Click to upload photos</p>
            <small>{existingImages.length + newImages.length} / 8 uploaded</small>
          </label>
        </div>

        {(existingImages.length > 0 || newPreviews.length > 0) && (
          <div className={styles.previewGrid}>
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className={styles.previewItem}>
                <img src={url} alt={`Existing ${index + 1}`} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeExistingImage(index)}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {newPreviews.map((preview, index) => (
              <div key={`new-${index}`} className={styles.previewItem}>
                <img src={preview} alt={`New ${index + 1}`} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeNewImage(index)}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          <span>This room is currently available</span>
        </label>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={submitting}>
        {submitting ? 'Saving...' : isEdit ? '✓ Save Changes' : '✓ Post Room Listing'}
      </button>
    </form>
  );
}

export default RoomForm;