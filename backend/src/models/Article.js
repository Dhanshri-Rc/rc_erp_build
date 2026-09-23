import mongoose from 'mongoose';
const positionBookingSchema = new mongoose.Schema({
  position: { type: Number, required: true, min: 1 },
  authorName: { type: String, required: true, trim: true },
  department: { type: String, trim: true, default: '' },
  college: { type: String, trim: true, default: '' },
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthorshipSale', required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['booked','released'], default: 'booked' }
}, { _id: false });
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true }, journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
  issn: { type: String, required: true, trim: true }, webUrl: { type: String, required: true, trim: true },
  availablePOS: { type: Number, default: 0, min: 0 }, totalPOS: { type: Number, required: true, min: 1, max: 100 }, pricePerAuthor: { type: Number, default: 0 },
  positionBookings: { type: [positionBookingSchema], default: [] },
  status: { type: String, enum: ['available','full','inactive'], default: 'available' }
}, { timestamps: true });
articleSchema.index({ journal: 1, title: 1 }, { unique: true });
export default mongoose.model('Article', articleSchema);
