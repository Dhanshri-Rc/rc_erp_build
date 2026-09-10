import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/rc_erp');
  if (!uri) throw new Error('MONGODB_URI is required in production');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
