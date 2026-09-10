import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true, index:true },
  tokenId: { type:String, required:true, unique:true },
  expiresAt: { type:Date, required:true, expires:0 },
  revokedAt: Date,
}, { timestamps:true });

export default mongoose.model('Session', schema);
