import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food:    { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  images:  [String],
}, { timestamps: true });

// One review per user per food
reviewSchema.index({ user: 1, food: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
