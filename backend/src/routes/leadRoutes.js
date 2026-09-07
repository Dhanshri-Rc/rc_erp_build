import { Router } from 'express'; import { protect, allow } from '../middleware/auth.js'; import { upload } from '../middleware/upload.js'; import { listLeads,createLead,updateLead } from '../controllers/leadController.js';
const r=Router(); r.use(protect,allow('admin','sales')); r.route('/').get(listLeads).post(upload.single('attachment'),createLead); r.put('/:id',updateLead); export default r;
