import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';

await connectDB();

try {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const admin = await User.findOne({ email }).select('+password');

  console.log('Database:', mongoose.connection.name);
  console.log('Admin found:', Boolean(admin));
  console.log('Role:', admin?.role ?? '—');
  console.log('Status:', admin?.status ?? '—');
  console.log(
    'Configured password matches:',
    admin ? await admin.comparePassword(process.env.SEED_ADMIN_PASSWORD ?? '') : false
  );
} finally {
  await mongoose.disconnect();
}
