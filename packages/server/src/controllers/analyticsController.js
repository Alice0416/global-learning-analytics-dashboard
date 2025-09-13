const analyticsService = require('../services/analyticsService');

async function ingest(req, res, next) {
  try {
    const result = await analyticsService.ingest(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
}

async function kpis(req, res, next) {
  try {
    const data = await analyticsService.kpis({ from: req.query.from, to: req.query.to });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function trends(req, res, next) {
  try {
    const data = await analyticsService.trends({
      metric: req.query.metric,
      from: req.query.from,
      to: req.query.to,
      bucket: req.query.bucket
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function popular(req, res, next) {
  try {
    const data = await analyticsService.popular({ top: Number(req.query.top || 10) });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { ingest, kpis, trends, popular };

