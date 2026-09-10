import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  receiptNo: { type: String, unique: true, required: true }, payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, amount: Number, paymentMode: String, transactionId: String, transactionDate: Date,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('Receipt', schema);
