const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const billingRoutes = require('./billingRoutes');
const adminRoutes = require('./adminRoutes');
const premiumRoutes = require('./premiumRoutes');
const webhookRoutes = require('./webhookRoutes');

router.use('/auth', authRoutes);
router.use('/billing', billingRoutes);
router.use('/admin', adminRoutes);
router.use('/premium', premiumRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;
