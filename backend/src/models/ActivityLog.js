import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: String, action: String, module: String, entityType: String, entityId: mongoose.Schema.Types.ObjectId,
  description: String, metadata: mongoose.Schema.Types.Mixed, ipAddress: String
}, { timestamps: true });
export default mongoose.model('ActivityLog', schema);
