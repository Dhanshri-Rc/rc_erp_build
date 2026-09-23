import { Router } from 'express';
import { protect, allow } from '../middleware/auth.js';
import { listVendors, vendorOptions, createVendor, getVendor, updateVendor, deleteVendor } from '../controllers/vendorController.js';

const r=Router();
r.use(protect);
r.get('/options',allow('admin','sales'),vendorOptions);
r.route('/').get(allow('admin'),listVendors).post(allow('admin'),createVendor);
r.route('/:id').get(allow('admin'),getVendor).put(allow('admin'),updateVendor).delete(allow('admin'),deleteVendor);
export default r;
