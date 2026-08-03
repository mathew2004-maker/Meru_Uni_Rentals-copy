import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://meru-uni-rentals-api.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;