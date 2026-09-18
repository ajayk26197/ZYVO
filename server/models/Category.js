import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  icon:        { type: String, default: '🍽️' },
  color:       { type: String, default: '#f3f4f6' },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
