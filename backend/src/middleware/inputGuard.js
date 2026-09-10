const hasUnsafeKey = (value) => {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasUnsafeKey);
  return Object.entries(value).some(([key, child]) => key.startsWith('$') || key.includes('.') || hasUnsafeKey(child));
};

export function rejectUnsafeInput(req, res, next) {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return res.status(400).json({ success:false, message:'Request contains invalid field names', errors:[] });
  }
  return next();
}
