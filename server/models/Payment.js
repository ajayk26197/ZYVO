import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order:        { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method:       { type: String, enum: ['cod', 'stripe', 'razorpay', 'upi', 'wallet'], required: true },
  amount:       { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  status:       { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  // Stripe / Razorpay refs
  gatewayOrderId:   { type: String, default: '' },
  gatewayPaymentId: { type: String, default: '' },
  gatewaySignature: { type: String, default: '' },
  // Refund
  refundId:     { type: String, default: '' },
  refundAmount: { type: Number, default: 0 },
  refundedAt:   { type: Date },
  // Timestamps
  paidAt:       { type: Date },
  failureReason:{ type: String, default: '' },
  receipt:      { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
