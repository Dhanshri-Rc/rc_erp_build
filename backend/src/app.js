import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';
import fileRoutes from './routes/fileRoutes.js';
import { enforceTrustedOrigin } from './middleware/origin.js';
import { rejectUnsafeInput } from './middleware/inputGuard.js';
import mongoose from 'mongoose';

const app = express();
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((x) => x.trim()).filter(Boolean);
app.use(cors({ origin(origin, cb) { cb(null, !origin || allowedOrigins.includes(origin)); }, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(cookieParser());
app.use(rejectUnsafeInput);
app.use(enforceTrustedOrigin(allowedOrigins));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_, res) => {
  const ready=mongoose.connection.readyState===1;
  return res.status(ready?200:503).json({success:ready,message:ready?'RC ERP API is healthy':'Database is unavailable'});
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/catalog', journalRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
