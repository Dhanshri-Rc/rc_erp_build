import mongoose from 'mongoose';
const journalSchema = new mongoose.Schema({
  name: { type: String, required: true }, shortName: String, issn: String, indexing: [String], publisher: String,
  authorCategories: [String], status: { type: String, enum: ['active','inactive'], default: 'active' }
}, { timestamps: true });
export default mongoose.model('Journal', journalSchema);
