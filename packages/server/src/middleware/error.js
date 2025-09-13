function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  res.status(status).json({ ok: false, error: { code, message } });
}

module.exports = { errorHandler };

