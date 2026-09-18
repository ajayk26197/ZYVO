import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  order:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agent: {
    name:   String,
    phone:  String,
    photo:  String,
    vehicleNo: String,
  },
  status: {
    type: String,
    enum: ['assigned', 'picked_up', 'on_the_way', 'delivered', 'failed'],
    default: 'assigned',
  },
  pickupAddress: {
    restaurant: String,
    street:     String,
    city:       String,
  },
  dropAddress: {
    name:    String,
    phone:   String,
    street:  String,
    city:    String,
    pincode: String,
  },
  estimatedTime:  { type: Number, default: 30 }, // minutes
  distanceKm:     { type: Number, default: 0 },
  trackingUrl:    { type: String, default: '' },
  currentLat:     { type: Number, default: null },
  currentLng:     { type: Number, default: null },
  pickedUpAt:     { type: Date },
  deliveredAt:    { type: Date },
  failureReason:  { type: String, default: '' },
  notes:          { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Delivery', deliverySchema);
