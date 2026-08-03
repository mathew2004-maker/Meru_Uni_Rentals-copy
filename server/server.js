import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/rooms.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'https://meru-uni-rentals-copy.vercel.app',
//     ],
//     credentials: true,
//   })
// );


app.use(cors());
app.use(express.json());


//health check endpoint
app.get('/', (req, res) => {
  res.send('Meru Uni Rentals API is running 🚀');
});

app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Failed to connect to MongoDB:', err);
}