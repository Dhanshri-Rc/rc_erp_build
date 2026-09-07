export const ok = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const fail = (res, message = 'Request failed', status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function pagination(query, defaults = { page: 1, limit: 10 }) {
  const page = Math.max(parseInt(query.page || defaults.page, 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || defaults.limit, 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function paginateMeta(page, limit, total) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
}
