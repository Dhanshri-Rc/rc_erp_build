import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Production JWT_SECRET must contain at least 32 characters');
}
connectDB().then(() => {
  const server=app.listen(port, () => console.log(`RC ERP API listening on port ${port}`));
  const shutdown=async(signal)=>{
    console.log(`${signal} received; shutting down safely`);
    server.close(async()=>{await mongoose.disconnect();process.exit(0);});
    setTimeout(()=>process.exit(1),10000).unref();
  };
  process.on('SIGTERM',()=>shutdown('SIGTERM'));
  process.on('SIGINT',()=>shutdown('SIGINT'));
}).catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
