import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const required=['SEED_ADMIN_USERNAME','SEED_ADMIN_EMAIL','SEED_ADMIN_PASSWORD'];
const missing=required.filter((key)=>!process.env[key]);
if(missing.length) throw new Error(`Missing required variables: ${missing.join(', ')}`);
if(process.env.SEED_ADMIN_PASSWORD.length<12) throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');

await connectDB();
const existing=await User.findOne({$or:[{email:process.env.SEED_ADMIN_EMAIL.toLowerCase()},{username:process.env.SEED_ADMIN_USERNAME.toLowerCase()}]});
if(existing) {
  console.log('Administrator already exists; no database changes were made.');
} else {
  await User.create({username:process.env.SEED_ADMIN_USERNAME,email:process.env.SEED_ADMIN_EMAIL,password:process.env.SEED_ADMIN_PASSWORD,fullName:'System Administrator',role:'admin',status:'active'});
  console.log('Administrator created successfully.');
}
await mongoose.disconnect();
