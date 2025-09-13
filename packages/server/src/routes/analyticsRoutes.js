const express = require('express');
const ctrl = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/ingest', auth(true), ctrl.ingest);
router.get('/kpis', auth(true), ctrl.kpis);
router.get('/trends', auth(true), ctrl.trends);
router.get('/popular', auth(false), ctrl.popular);

module.exports = router;

