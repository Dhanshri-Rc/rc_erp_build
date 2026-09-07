import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true }, issueType: String, volume: String, issue: String,
  month: String, year: Number, publicationDate: Date, active: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('JournalIssue', schema);
