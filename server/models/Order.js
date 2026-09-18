import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  food:      { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name:      String,
  image:     String,
  price:     Number,
  qty:       { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:    [orderItemSchema],
  address: {
    name:    String,
    phone:   String,
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
  },
  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, default: 49 },
  discount:    { type: Number, default: 0 },
  total:       { type: Number, required: true },
  coupon:      { type: String, default: '' },
  paymentMethod:  { type: String, enum: ['cod','online'], default: 'cod' },
  paymentStatus:  { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  paymentId:      { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'],
    default: 'pending',
  },
  estimatedDelivery: Date,
  deliveredAt:       Date,
  cancelReason:      String,
  notes:             String,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
