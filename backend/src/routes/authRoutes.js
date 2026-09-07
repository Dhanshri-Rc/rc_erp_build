import { Router } from 'express';
import { login, logout, me, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
const r=Router(); r.post('/login',login); r.post('/logout',logout); r.get('/me',protect,me); r.post('/forgot-password',forgotPassword); export default r;
