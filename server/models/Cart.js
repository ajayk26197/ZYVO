import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  food:       { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name:       String,
  image:      String,
  price:      Number,
  qty:        { type: Number, required: true, min: 1, default: 1 },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
});

const cartSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:      [cartItemSchema],
  coupon:     { type: String, default: '' },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
}, { timestamps: true });

// Virtuals
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
});

cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, i) => sum + i.qty, 0);
});

cartSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Cart', cartSchema);
