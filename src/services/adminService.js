const prisma = require('../config/db');

const getStats = async () => {
    const [
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        basicCount,
        proCount,
        premiumCount,
        newSignupsThisMonth,
        canceledCount,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.payment.aggregate({ _sum: { amount: true } }),
        prisma.subscription.count({ where: { plan: 'BASIC', status: 'ACTIVE' } }),
        prisma.subscription.count({ where: { plan: 'PRO', status: 'ACTIVE' } }),
        prisma.subscription.count({ where: { plan: 'PREMIUM', status: 'ACTIVE' } }),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
        prisma.subscription.count({ where: { status: 'CANCELED' } }),
    ]);

    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const churnRate = totalUsers > 0 ? ((canceledCount / totalUsers) * 100).toFixed(2) : 0;

    return {
        totalUsers,
        activeSubscriptions,
        totalRevenue: totalRevenueAmount,
        newSignupsThisMonth,
        churnRate: Number(churnRate),
        breakdown: {
            basic: basicCount,
            pro: proCount,
            premium: premiumCount,
        },
    };
};

const getRecentUsers = async (limit = 10) => {
    const users = await prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            subscription: {
                select: { plan: true, status: true },
            },
        },
    });

    return users;
};

const getRecentPayments = async (limit = 20) => {
    const payments = await prisma.payment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { email: true },
            },
        },
    });

    return payments;
};

module.exports = {
    getStats,
    getRecentUsers,
    getRecentPayments,
};
