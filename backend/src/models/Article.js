import mongoose from 'mongoose';
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true }, journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
  availablePOS: { type: Number, default: 0, min: 0 }, totalPOS: { type: Number, default: 0 }, pricePerAuthor: { type: Number, default: 0 },
  status: { type: String, enum: ['available','full','inactive'], default: 'available' }
}, { timestamps: true });
export default mongoose.model('Article', articleSchema);
