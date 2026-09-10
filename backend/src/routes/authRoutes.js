import { Router } from 'express';
import { login, logout, me, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/loginLimiter.js';
const r=Router(); r.post('/login',loginLimiter,login); r.post('/logout',protect,logout); r.get('/me',protect,me); r.post('/forgot-password',loginLimiter,forgotPassword); export default r;
