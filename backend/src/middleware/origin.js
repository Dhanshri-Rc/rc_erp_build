const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const enforceTrustedOrigin = (allowedOrigins) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method) || !req.cookies?.rcerp_token) return next();
  const origin = req.get('origin');
  if (origin && allowedOrigins.includes(origin)) return next();
  return res.status(403).json({ success: false, message: 'Untrusted request origin', errors: [] });
};
