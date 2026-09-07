import mongoose from 'mongoose';
const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true, trim: true },
  businessType: { type: String, required: true },
  vendorCategory: String,
  address: { type: String, required: true }, city: { type: String, required: true }, state: { type: String, required: true }, country: { type: String, required: true }, postalCode: { type: String, required: true },
  mobile: { type: String, required: true }, email: { type: String, required: true, lowercase: true }, gstNumber: String,
  contactPerson: String, designation: String, alternateMobile: String, panNumber: String, website: String,
  vendorSince: Date, paymentTerms: String, creditLimit: { type: Number, default: 0 }, preferredPaymentMode: String, notes: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('Vendor', vendorSchema);
