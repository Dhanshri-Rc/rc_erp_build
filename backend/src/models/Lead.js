import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  leadNo: { type: String, unique: true }, leadTitle: { type: String, required: true }, leadType: String, priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  leadFor: String, expectedDealType: String, targetBudget: Number, description: String,
  contactName: { type: String, required: true }, email: String, mobile: String, organization: String, designation: String, country: String, preferredContactMethod: String, bestTimeToContact: String, alternateContact: String,
  subjectArea: String, journalType: String, indexingPreference: String, expectedTimeline: String, volumeFrequency: String, expectedArticles: Number,
  leadSource: String, referredBy: String, attachment: String, remarks: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, nextFollowUpDate: Date, followUpStatus: String,
  status: { type: String, enum: ['new','contacted','discussion','proposal','negotiation','converted','closed'], default: 'new' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, convertedToDeal: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ assignedTo: 1, status: 1, nextFollowUpDate: 1 });
schema.index({ createdBy: 1, createdAt: -1 });
export default mongoose.model('Lead', schema);
