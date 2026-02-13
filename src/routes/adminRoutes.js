const express = require('express');
const {
    getDashboardStats,
    getRecentUsers,
    getRecentPayments,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getRecentUsers);
router.get('/payments', getRecentPayments);

module.exports = router;
