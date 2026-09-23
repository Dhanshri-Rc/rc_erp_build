import mongoose from 'mongoose';
const journalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, shortName: String,
  issn: { type: String, required: true, trim: true }, webUrl: { type: String, required: true, trim: true }, indexing: [String], publisher: String,
  authorCategories: [String], status: { type: String, enum: ['active','inactive'], default: 'active' }
}, { timestamps: true });
journalSchema.index({ name: 1, issn: 1 }, { unique: true });
export default mongoose.model('Journal', journalSchema);
