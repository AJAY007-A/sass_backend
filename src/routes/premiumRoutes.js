const express = require('express');
const { getPremiumContent } = require('../controllers/premiumController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.get('/', protect, checkSubscription, getPremiumContent);

module.exports = router;
