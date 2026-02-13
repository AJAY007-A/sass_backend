const asyncHandler = require('../utils/asyncHandler');
const billingService = require('../services/billingService');

const createSubscription = asyncHandler(async (req, res) => {
    const { plan } = req.body;
    const data = await billingService.createSubscription(req.user.id, plan);

    res.status(200).json({
        status: 'success',
        data,
    });
});

const cancelSubscription = asyncHandler(async (req, res) => {
    const data = await billingService.cancelSubscription(req.user.id);

    res.status(200).json({
        status: 'success',
        data,
    });
});

const getSubscription = asyncHandler(async (req, res) => {
    const subscription = await billingService.getSubscription(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { subscription },
    });
});

const getPaymentHistory = asyncHandler(async (req, res) => {
    const payments = await billingService.getPaymentHistory(req.user.id);

    res.status(200).json({
        status: 'success',
        results: payments.length,
        data: { payments },
    });
});

module.exports = {
    createSubscription,
    cancelSubscription,
    getSubscription,
    getPaymentHistory,
};
