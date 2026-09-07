import { Router } from 'express'; import { protect, allow } from '../middleware/auth.js'; import { listVendors, createVendor, getVendor, updateVendor } from '../controllers/vendorController.js';
const r=Router(); r.use(protect,allow('admin','sales')); r.route('/').get(listVendors).post(createVendor); r.route('/:id').get(getVendor).put(updateVendor); export default r;
