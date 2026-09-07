import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const cookieToken = req.cookies?.rcerp_token;
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
    const token = cookieToken || bearer;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required', errors: [] });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-change-me');
    const user = await User.findById(payload.id).select('-password');
    if (!user || user.status !== 'active') return res.status(401).json({ success: false, message: 'Account is unavailable', errors: [] });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session', errors: [] });
  }
}

export const allow = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'You do not have permission to perform this action', errors: [] });
  next();
};
