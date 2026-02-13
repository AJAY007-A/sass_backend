const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const prisma = require('../config/db');

const checkSubscription = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id },
    });

    if (!subscription) {
        return next(new AppError('No subscription found — please subscribe to a plan', 403));
    }

    const allowed = ['ACTIVE', 'TRIALING'];
    if (!allowed.includes(subscription.status)) {
        return next(new AppError('Your subscription is not active — please renew', 403));
    }

    if (subscription.plan === 'FREE') {
        return next(new AppError('Upgrade to a paid plan to access this feature', 403));
    }

    req.subscription = subscription;
    next();
});

module.exports = { checkSubscription };
