export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, errors: [] });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || (err.name === 'ValidationError' ? 422 : 500);
  const errors = err.errors ? Object.values(err.errors).map((e) => e.message) : [];
  res.status(status).json({ success: false, message: err.message || 'Internal server error', errors });
}
