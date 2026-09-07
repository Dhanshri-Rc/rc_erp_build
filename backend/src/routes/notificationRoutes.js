import { Router } from 'express'; import { protect } from '../middleware/auth.js'; import { list,readOne,readAll } from '../controllers/notificationController.js';
const r=Router(); r.use(protect); r.get('/',list); r.patch('/read-all',readAll); r.patch('/:id/read',readOne); export default r;
