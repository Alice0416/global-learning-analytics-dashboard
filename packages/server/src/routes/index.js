const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const courseRoutes = require('./courseRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const recommendRoutes = require('./recommendRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/recommend', recommendRoutes);

module.exports = router;

