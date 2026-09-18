import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true },
  type:          { type: String, enum: ['percent','flat'], default: 'percent' },
  value:         { type: Number, required: true },
  minOrder:      { type: Number, default: 0 },
  maxDiscount:   { type: Number, default: 0 }, // 0 = no cap
  usageLimit:    { type: Number, default: 0 },  // 0 = unlimited
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
  description:   { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
