import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  businessType: { type: String, enum: ['B-B','B-C'], required: true },
  contactPerson: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  mobile: { type: String, trim: true, default: '' },
  department: { type: String, trim: true, default: '' },
  college: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

clientSchema.index({ createdBy: 1, createdAt: -1 });
clientSchema.index({ createdBy: 1, clientName: 1 });
export default mongoose.model('Client', clientSchema);
