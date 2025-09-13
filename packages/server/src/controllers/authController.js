const authService = require('../services/authService');
const { requireBodyFields } = require('../utils/validator');

async function register(req, res, next) {
  try {
    requireBodyFields(req.body, ['email', 'password', 'name']);
    const user = await authService.register(req.body);
    res.status(201).json({ ok: true, data: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    requireBodyFields(req.body, ['email', 'password']);
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.json({ ok: true, data: { accessToken, refreshToken, user: { id: user._id, email: user.email, name: user.name } } });
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    requireBodyFields(req.body, ['refreshToken']);
    const { accessToken } = await authService.refresh({ token: req.body.refreshToken });
    res.json({ ok: true, data: { accessToken } });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, refresh };

