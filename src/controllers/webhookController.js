const asyncHandler = require('../utils/asyncHandler');
const webhookService = require('../services/webhookService');

const handleRazorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    await webhookService.processWebhook(req.body, signature);

    res.status(200).json({ received: true });
});

module.exports = {
    handleRazorpayWebhook,
};
