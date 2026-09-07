import User from '../models/User.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity, notifyUser } from '../utils/audit.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ fullName: re }, { username: re }, { email: re }, { contactNumber: re }];
  }
  const [data, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);
  return ok(res, { items: data, pagination: paginateMeta(page, limit, total) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword, fullName, contactNumber, role, status = 'active' } = req.body;
  if (!username || !email || !password || !fullName || !role) return res.status(422).json({ success: false, message: 'Please complete all required fields', errors: [] });
  if (!['sales','finance'].includes(role)) return res.status(422).json({ success: false, message: 'Regular user creation is limited to Sales and Finance users', errors: [] });
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(422).json({ success: false, message: 'Password must be at least 8 characters and include a letter and a number', errors: [] });
  if (confirmPassword !== undefined && password !== confirmPassword) return res.status(422).json({ success: false, message: 'Passwords do not match', errors: [] });
  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
  if (exists) return res.status(409).json({ success: false, message: 'Username or email already exists', errors: [] });
  const user = await User.create({ username, email, password, fullName, contactNumber, role, status, createdBy: req.user._id });
  await logActivity(req, { action: 'USER_CREATED', module: 'users', entityType: 'User', entityId: user._id, description: `Created ${role} user ${fullName}` });
  await notifyUser(user._id, { title: 'Account created', message: 'Your RC ERP account has been created by the administrator.', type: 'success', link: `/${role}/dashboard` });
  const data = user.toObject(); delete data.password;
  return ok(res, data, 'User created successfully', 201);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found', errors: [] });
  return ok(res, user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['fullName','contactNumber','status'];
  const patch = {}; allowed.forEach((k) => req.body[k] !== undefined && (patch[k] = req.body[k]));
  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found', errors: [] });
  await logActivity(req, { action: 'USER_UPDATED', module: 'users', entityType: 'User', entityId: user._id, description: `Updated ${user.fullName}` });
  return ok(res, user, 'User updated successfully');
});

export const setStatus = asyncHandler(async (req, res) => {
  if (!['active','inactive'].includes(req.body.status)) return res.status(422).json({ success:false, message:'Invalid status', errors:[] });
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success:false, message:'User not found', errors:[] });
  await logActivity(req, { action: req.body.status === 'active' ? 'USER_ENABLED' : 'USER_DISABLED', module:'users', entityType:'User', entityId:user._id, description:`${user.fullName} set to ${req.body.status}` });
  return ok(res, user, `User ${req.body.status}`);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const password = req.body.password;
  if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(422).json({ success:false, message:'New password must be at least 8 characters and include a letter and a number', errors:[] });
  const user = await User.findById(req.params.id).select('+password');
  if (!user) return res.status(404).json({ success:false, message:'User not found', errors:[] });
  user.password = password; user.passwordChangedAt = new Date(); await user.save();
  await logActivity(req, { action:'PASSWORD_RESET', module:'users', entityType:'User', entityId:user._id, description:`Password reset for ${user.fullName}` });
  return ok(res, null, 'Password reset successfully');
});
