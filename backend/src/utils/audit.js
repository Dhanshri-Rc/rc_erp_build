import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export async function logActivity(req, { action, module, entityType, entityId, description, metadata = {} }, options = {}) {
  const [entry] = await ActivityLog.create([{ user: req.user?._id, role: req.user?.role, action, module, entityType, entityId, description, metadata, ipAddress: req.ip }], options);
  return entry;
}

export async function notifyUser(user, payload, options = {}) {
  if (!user) return null;
  const [notification] = await Notification.create([{ user, ...payload }], options);
  return notification;
}

export async function notifyRoles(roles, payload, options = {}) {
  const query = User.find({ role: { $in: roles }, status: 'active' }).select('_id');
  if (options.session) query.session(options.session);
  const users = await query;
  if (!users.length) return [];
  return Notification.insertMany(users.map((u) => ({ user: u._id, ...payload })), options);
}
