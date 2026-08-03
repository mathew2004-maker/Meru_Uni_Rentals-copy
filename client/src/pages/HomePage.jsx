import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';
import RoomList from '../components/RoomList/RoomList';
import styles from './HomePage.module.css';

const ROOM_TYPES = [
  'All',
  'Single Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  'Self-Contained',
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

function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesType = filter === 'All' || room.roomType === filter;
    const matchesLocation = locationFilter === 'All' || room.location === locationFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      room.title.toLowerCase().includes(query) ||
      room.location.toLowerCase().includes(query) ||
      room.description.toLowerCase().includes(query);
    return matchesType && matchesLocation && matchesSearch;
  });

  

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Meru Rooms | Rental Houses Near Meru University</title>
        <meta name="description" content="Find affordable rental houses, single rooms, bedsitters and apartments near Meru University of Science and Technology. Browse listings in Nchiru, Kianjai, California, Runda and more." />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Helmet>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Find Your Perfect Room Near Meru University</h1>
          <p>Browse vacant rental houses posted by fellow students and landlords. No sign-up needed.</p>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.filterBar}>
          {ROOM_TYPES.map((type) => (
            <button
              key={type}
              className={`${styles.filterBtn} ${filter === type ? styles.active : ''}`}
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}

          <select
              className={`${styles.locationSelect} ${locationFilter !== 'All' ? styles.activeLocation : ''}`}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
            <option value="All">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.resultsHeader}>
          <h2>{filteredRooms.length} Room{filteredRooms.length !== 1 ? 's' : ''} Available</h2>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading rooms...</p>
          </div>
        ) : (
          <RoomList rooms={filteredRooms} />
        )}

        <section className={styles.seoSection}>
          <h2>Find Rental Houses Near Meru University</h2>
          <p>
            Comrades Rentals connects students with rental houses in Nchiru,California, Kianjai, Cedar, Kiridine, Mascan, and around
            Meru University of Science and Technology. Whether you need a single room,
            bedsitter, or self-contained apartment, browse verified listings and make a call. Looking for rental houses in Nchiru or houses to rent in Meru University? Start here.
          </p>
        </section>

      </section>
    </div>
  );
}

export default HomePage;