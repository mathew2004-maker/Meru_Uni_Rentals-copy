import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: {
        values: ['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Self-Contained'],
        message: 'Please select a valid room type',
      },
    },
    landlordPhone: {
      type: String,
      required: [true, 'Landlord contact is required'],
      trim: true,
    },
    caretakerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 8;
        },
        message: 'Cannot upload more than 8 images',
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;