import { Router } from 'express';
import { protect, allow } from '../middleware/auth.js';
import { listUsers, createUser, getUser, updateUser, setStatus, resetPassword } from '../controllers/userController.js';
const r=Router(); r.use(protect,allow('admin')); r.route('/').get(listUsers).post(createUser); r.route('/:id').get(getUser).put(updateUser); r.patch('/:id/status',setStatus); r.post('/:id/reset-password',resetPassword); export default r;
