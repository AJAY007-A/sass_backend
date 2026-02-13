const asyncHandler = require('../utils/asyncHandler');

const getPremiumContent = asyncHandler(async (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            message: 'You have access to premium content',
            plan: req.subscription.plan,
            features: [
                'Advanced Analytics',
                'Priority Support',
                'Custom Integrations',
                'Unlimited Exports',
                'API Access',
            ],
        },
    });
});

module.exports = {
    getPremiumContent,
};
