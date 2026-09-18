import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  originalPrice:{ type: Number, default: 0 },
  discount:     { type: Number, default: 0, min: 0, max: 100 },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image:        { type: String, required: true },
  images:       [String],
  isVeg:        { type: Boolean, default: false },
  isAvailable:  { type: Boolean, default: true },
  isFeatured:   { type: Boolean, default: false },
  prepTime:     { type: Number, default: 20 }, // minutes
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  numReviews:   { type: Number, default: 0 },
  tags:         [String],
  ingredients:  [String],
  nutrition: {
    calories: Number,
    protein:  Number,
    carbs:    Number,
    fat:      Number,
  },
}, { timestamps: true });

// Text search index
foodSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Food', foodSchema);
