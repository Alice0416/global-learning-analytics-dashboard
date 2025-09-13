const express = require('express');
const { recommendMe } = require('../controllers/recommendController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth(true), recommendMe);

module.exports = router;

