const razorpay = require('../config/razorpay');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const PLAN_MAP = {
    BASIC: process.env.RAZORPAY_PLAN_BASIC,
    PRO: process.env.RAZORPAY_PLAN_PRO,
    PREMIUM: process.env.RAZORPAY_PLAN_PREMIUM,
};

const createSubscription = async (userId, plan) => {
    if (!PLAN_MAP[plan]) {
        throw new AppError('Invalid plan. Choose BASIC, PRO, or PREMIUM.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const rzpSubscription = await razorpay.subscriptions.create({
        plan_id: PLAN_MAP[plan],
        customer_notify: 1,
        total_count: 12,
        notes: {
            userId: user.id,
            userEmail: user.email,
        },
    });

    await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
            razorpaySubscriptionId: rzpSubscription.id,
            plan,
            status: 'TRIALING',
        },
        create: {
            userId: user.id,
            razorpaySubscriptionId: rzpSubscription.id,
            plan,
            status: 'TRIALING',
        },
    });

    return {
        subscriptionId: rzpSubscription.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    };
};

const cancelSubscription = async (userId) => {
    const sub = await prisma.subscription.findUnique({ where: { userId } });

    if (!sub || !sub.razorpaySubscriptionId) {
        throw new AppError('No active subscription found to cancel', 404);
    }

    await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId);

    await prisma.subscription.update({
        where: { userId },
        data: { status: 'CANCELED' },
    });

    return { message: 'Subscription canceled successfully' };
};

const getSubscription = async (userId) => {
    const sub = await prisma.subscription.findUnique({ where: { userId } });

    if (!sub) {
        throw new AppError('No subscription found', 404);
    }

    return sub;
};

const getPaymentHistory = async (userId) => {
    const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    return payments;
};

module.exports = {
    createSubscription,
    cancelSubscription,
    getSubscription,
    getPaymentHistory,
};
