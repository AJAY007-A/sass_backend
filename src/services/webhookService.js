const crypto = require('crypto');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');

const verifySignature = (body, signature) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex');

    return expectedSignature === signature;
};

const processWebhook = async (body, signature) => {
    if (!verifySignature(body, signature)) {
        throw new AppError('Invalid webhook signature', 400);
    }

    const event = body.event;
    const payload = body.payload;

    switch (event) {
        case 'subscription.activated':
            await handleActivated(payload.subscription);
            break;

        case 'subscription.charged':
            await handleCharged(payload.payment, payload.subscription);
            break;

        case 'subscription.completed':
        case 'subscription.cancelled':
            await handleCancelled(payload.subscription);
            break;

        case 'subscription.pending':
            await handlePending(payload.subscription);
            break;

        case 'payment.failed':
            await handlePaymentFailed(payload.payment, payload.subscription);
            break;

        default:
            break;
    }
};

async function handleActivated(subscription) {
    const rzpSubId = subscription.entity.id;
    const currentEnd = subscription.entity.current_end;

    const dbSub = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: rzpSubId },
        include: { user: true },
    });

    if (!dbSub) return;

    await prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
            status: 'ACTIVE',
            currentPeriodEnd: currentEnd ? new Date(currentEnd * 1000) : null,
        },
    });

    emailService.sendSubscriptionEmail(dbSub.user.email, dbSub.plan).catch(() => { });
}

async function handleCharged(payment, subscription) {
    const paymentEntity = payment.entity;
    const rzpSubId = subscription.entity.id;

    const dbSub = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: rzpSubId },
    });

    if (!dbSub) return;

    const existingPayment = await prisma.payment.findUnique({
        where: { razorpayPaymentId: paymentEntity.id },
    });

    if (!existingPayment) {
        await prisma.payment.create({
            data: {
                userId: dbSub.userId,
                amount: paymentEntity.amount,
                currency: paymentEntity.currency || 'INR',
                razorpayPaymentId: paymentEntity.id,
            },
        });
    }

    const currentEnd = subscription.entity.current_end;
    await prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
            status: 'ACTIVE',
            currentPeriodEnd: currentEnd ? new Date(currentEnd * 1000) : null,
        },
    });
}

async function handleCancelled(subscription) {
    const rzpSubId = subscription.entity.id;

    const dbSub = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: rzpSubId },
        include: { user: true },
    });

    if (!dbSub) return;

    await prisma.subscription.update({
        where: { id: dbSub.id },
        data: { status: 'CANCELED' },
    });

    emailService.sendCancellationEmail(dbSub.user.email).catch(() => { });
}

async function handlePending(subscription) {
    const rzpSubId = subscription.entity.id;

    await prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: rzpSubId },
        data: { status: 'PAST_DUE' },
    });
}

async function handlePaymentFailed(payment, subscription) {
    const rzpSubId = subscription?.entity?.id;
    if (!rzpSubId) return;

    await prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: rzpSubId },
        data: { status: 'PAST_DUE' },
    });
}

module.exports = { processWebhook };
