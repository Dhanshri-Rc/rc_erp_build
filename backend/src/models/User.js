import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  fullName: { type: String, required: true, trim: true },
  contactNumber: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'sales', 'finance'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  avatar: { type: String, default: '' },
  lastLogin: Date,
  passwordChangedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(value) { return bcrypt.compare(value, this.password); };
export default mongoose.model('User', userSchema);
