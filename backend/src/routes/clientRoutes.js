import { Router } from 'express';
import { protect, allow } from '../middleware/auth.js';
import { listClients, createClient, getClient, updateClient, deleteClient } from '../controllers/clientController.js';

const r=Router();
r.use(protect,allow('sales'));
r.route('/').get(listClients).post(createClient);
r.route('/:id').get(getClient).put(updateClient).delete(deleteClient);
export default r;
