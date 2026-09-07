import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export async function logActivity(req, { action, module, entityType, entityId, description, metadata = {} }) {
  return ActivityLog.create({ user: req.user?._id, role: req.user?.role, action, module, entityType, entityId, description, metadata, ipAddress: req.ip });
}

export async function notifyUser(user, payload) {
  if (!user) return null;
  return Notification.create({ user, ...payload });
}

export async function notifyRoles(roles, payload) {
  const users = await User.find({ role: { $in: roles }, status: 'active' }).select('_id');
  if (!users.length) return [];
  return Notification.insertMany(users.map((u) => ({ user: u._id, ...payload })));
}
