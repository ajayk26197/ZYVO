import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  banner:      { type: String, default: '' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone:       { type: String, default: '' },
  email:       { type: String, default: '' },
  address: {
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
    lat:     Number,
    lng:     Number,
  },
  cuisines:    [String],
  categories:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  numReviews:  { type: Number, default: 0 },
  deliveryTime:{ type: Number, default: 30 }, // minutes
  deliveryFee: { type: Number, default: 49 },
  minOrder:    { type: Number, default: 0 },
  isOpen:      { type: Boolean, default: true },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  openingHours: {
    open:  { type: String, default: '09:00' },
    close: { type: String, default: '23:00' },
  },
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
