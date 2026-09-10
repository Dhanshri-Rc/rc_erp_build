export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, errors: [] });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const duplicate = err?.code === 11000;
  const status = err.status || (duplicate ? 409 : err.name === 'ValidationError' || err.name === 'CastError' ? 422 : 500);
  const errors = err.errors ? Object.values(err.errors).map((e) => e.message) : [];
  const publicMessage = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : duplicate ? 'A record with that value already exists' : err.message || 'Internal server error';
  res.status(status).json({ success: false, message: publicMessage, errors });
}
