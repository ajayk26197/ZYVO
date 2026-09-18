import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label:     { type: String, default: 'Home', enum: ['Home', 'Work', 'Other'] },
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  street:    { type: String, required: true },
  landmark:  { type: String, default: '' },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  lat:       { type: Number, default: null },
  lng:       { type: Number, default: null },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure only one default address per user
addressSchema.pre('save', async function () {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

export default mongoose.model('Address', addressSchema);
