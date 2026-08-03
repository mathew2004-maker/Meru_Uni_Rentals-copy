import express from 'express';
import Room from '../models/Room.js';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const router = express.Router();

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('postedBy', 'username');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new room
router.post('/', authenticate, upload.array('images', 8), async (req, res) => {
  try {
    const imageUrls = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, 'meru-rooms'))
    );

    const amenities = req.body.amenities
      ? req.body.amenities.split(',').map((a) => a.trim()).filter((a) => a.length > 0)
      : [];

    const room = new Room({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      location: req.body.location,
      roomType: req.body.roomType,
      landlordPhone: req.body.landlordPhone,
      caretakerPhone: req.body.caretakerPhone || '',
      images: imageUrls,
      amenities,
      available: req.body.available === 'true' || req.body.available === true,
      postedBy: req.user.userId,
    });

    const savedRoom = await room.save();
    await savedRoom.populate('postedBy', 'username');
    res.status(201).json(savedRoom);
  } catch (err) {
    console.error('POST ROOM ERROR:', err);
    res.status(400).json({ message: err.message });
  }
});

// UPDATE room (owner only)
router.put('/:id', authenticate, upload.array('images', 8), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this room' });
    }

    let keptImages = [];
    if (req.body.existingImages) {
      keptImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    }

    const newImageUrls =
      req.files.length > 0
        ? await Promise.all(
            req.files.map((file) => uploadToCloudinary(file.buffer, 'meru-rooms'))
          )
        : [];

    const totalImages = keptImages.length + newImageUrls.length;
    if (totalImages > 8) {
      return res.status(400).json({ message: 'Maximum 8 images allowed' });
    }

    const amenities = req.body.amenities
      ? req.body.amenities.split(',').map((a) => a.trim()).filter((a) => a.length > 0)
      : room.amenities;

    room.title = req.body.title || room.title;
    room.description = req.body.description || room.description;
    room.price = req.body.price ? Number(req.body.price) : room.price;
    room.location = req.body.location || room.location;
    room.roomType = req.body.roomType || room.roomType;
    room.landlordPhone = req.body.landlordPhone || room.landlordPhone;
    room.caretakerPhone = req.body.caretakerPhone !== undefined ? req.body.caretakerPhone : room.caretakerPhone;
    room.amenities = amenities;
    room.available = req.body.available === 'true' || req.body.available === true;
    room.images = [...keptImages, ...newImageUrls];

    await room.save();
    await room.populate('postedBy', 'username');
    res.json(room);
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE room (owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;