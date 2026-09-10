import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  paymentNo: { type: String, unique: true }, sourceType: { type: String, enum: ['authorship','publication'], required: true }, sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, amount: { type: Number, required: true, min: 0.01 }, paymentMode: String, transactionId: String, transactionDate: Date, proof: String,
  status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' }, notes: String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, verifiedAt: Date
}, { timestamps: true });
schema.index({ status: 1, createdAt: -1 });
schema.index({ submittedBy: 1, createdAt: -1 });
schema.index({ sourceType: 1, sourceId: 1, status: 1 });
export default mongoose.model('Payment', schema);
