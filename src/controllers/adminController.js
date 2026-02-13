const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');

const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getStats();

    res.status(200).json({
        status: 'success',
        data: { stats },
    });
});

const getRecentUsers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const users = await adminService.getRecentUsers(limit);

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});

const getRecentPayments = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 20;
    const payments = await adminService.getRecentPayments(limit);

    res.status(200).json({
        status: 'success',
        results: payments.length,
        data: { payments },
    });
});

module.exports = {
    getDashboardStats,
    getRecentUsers,
    getRecentPayments,
};
