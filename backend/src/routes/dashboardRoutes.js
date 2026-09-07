import { Router } from 'express'; import { protect, allow } from '../middleware/auth.js'; import { adminDashboard,salesDashboard,financeDashboard } from '../controllers/dashboardController.js';
const r=Router(); r.use(protect); r.get('/admin',allow('admin'),adminDashboard); r.get('/sales',allow('sales'),salesDashboard); r.get('/finance',allow('finance'),financeDashboard); export default r;
