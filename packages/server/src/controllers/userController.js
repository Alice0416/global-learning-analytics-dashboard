const User = require('../models/User');

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('email name role createdAt');
    res.json({ ok: true, data: user });
  } catch (e) {
    next(e);
  }
}

module.exports = { me };

