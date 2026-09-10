import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { downloadFile } from '../controllers/fileController.js';

const router = Router();
router.get('/:filename', protect, downloadFile);
export default router;
