const express = require('express');
const { list, detail, enroll } = require('../controllers/courseController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', list);
router.get('/:id', detail);
router.post('/enroll', auth(true), enroll);

module.exports = router;

