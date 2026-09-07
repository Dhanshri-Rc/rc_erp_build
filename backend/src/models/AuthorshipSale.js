import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  saleNo: { type: String, unique: true }, journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true }, article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, availablePOSAtSale: Number, numberOfAuthors: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true }, pricePerAuthor: { type: Number, required: true }, advancePayment: { type: Number, default: 0 }, remainingAmount: { type: Number, default: 0 },
  authors: { type: String, required: true }, paymentAccount: String, paymentMode: String, transactionId: String, transactionDate: Date, paymentProof: String, remarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, status: { type: String, enum: ['draft','confirmed','completed','cancelled'], default: 'confirmed' },
  paymentStatus: { type: String, enum: ['pending','partial','paid'], default: 'pending' }
}, { timestamps: true });
export default mongoose.model('AuthorshipSale', schema);
