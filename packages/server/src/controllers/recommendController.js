const { getRecommendationsForUser } = require('../services/recommendService');

async function recommendMe(req, res, next) {
  try {
    const top = Number(req.query.top || 10);
    const data = await getRecommendationsForUser(req.user.id, top);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { recommendMe };

