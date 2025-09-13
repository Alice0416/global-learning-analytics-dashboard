const express = require('express');
const { me } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth(true), me);

module.exports = router;

