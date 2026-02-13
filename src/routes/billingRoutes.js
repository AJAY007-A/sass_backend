const express = require('express');
const {
    createSubscription,
    cancelSubscription,
    getSubscription,
    getPaymentHistory,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/subscribe', createSubscription);
router.post('/cancel', cancelSubscription);
router.get('/subscription', getSubscription);
router.get('/payments', getPaymentHistory);

module.exports = router;
