const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');
const { assert, isEmail } = require('../utils/validator');

function signAccess(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: env.ACCESS_TOKEN_TTL
  });
}

function signRefresh(user) {
  return jwt.sign({ type: 'refresh' }, env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: env.REFRESH_TOKEN_TTL
  });
}

async function register({ email, password, name }) {
  assert(isEmail(email), 'Invalid email');
  assert(typeof password === 'string' && password.length >= 6, 'Password too short');
  assert(typeof name === 'string' && name.length >= 1, 'Name required');
  const exists = await User.findOne({ email });
  assert(!exists, 'Email already registered', 'CONFLICT');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name, role: 'user' });
  return user;
}

async function login({ email, password }) {
  assert(isEmail(email), 'Invalid email');
  const user = await User.findOne({ email });
  assert(user, 'Invalid credentials', 'UNAUTHORIZED');
  const ok = await bcrypt.compare(password, user.passwordHash);
  assert(ok, 'Invalid credentials', 'UNAUTHORIZED');
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  return { user, accessToken, refreshToken };
}

async function refresh({ token }) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    assert(payload && payload.sub, 'Invalid refresh token', 'UNAUTHORIZED');
    const user = await User.findById(payload.sub);
    assert(user, 'User not found', 'UNAUTHORIZED');
    return { accessToken: signAccess(user) };
  } catch (e) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
}

module.exports = { register, login, refresh };

