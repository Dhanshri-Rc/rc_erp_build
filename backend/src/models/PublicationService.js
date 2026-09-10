import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  publicationNo: { type: String, unique: true }, journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true }, issueType: String, journalIssue: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalIssue' },
  paperTitle: { type: String, required: true }, vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, authorCategory: String,
  currency: { type: String, default: 'INR' }, exchangeRate: { type: Number, default: 1, min: 0.000001 }, totalAmount: { type: Number, required: true, min: 0 }, advanceAmount: { type: Number, default: 0, min: 0 }, remainingAmount: { type: Number, default: 0, min: 0 },
  paymentAccount: String, paymentMode: String, transactionId: String, transactionDate: Date, paymentProof: String,
  expectedPublicationDate: Date, doi: String, manuscriptStatus: String, numberOfAuthors: Number, correspondingAuthor: String, remarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, paymentStatus: { type: String, enum: ['pending','partial','paid'], default: 'pending' }
}, { timestamps: true });
schema.index({ createdBy: 1, createdAt: -1 });
schema.index({ vendor: 1, createdAt: -1 });
export default mongoose.model('PublicationService', schema);
