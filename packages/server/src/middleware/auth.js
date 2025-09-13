const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function auth(required = true) {
  return (req, res, next) => {
    const hdr = req.headers['authorization'] || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) {
      if (required) return res.status(401).json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
      return next();
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch (err) {
      return res.status(401).json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
  };
}

module.exports = { auth };

