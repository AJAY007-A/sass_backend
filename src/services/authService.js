const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');

const registerUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        throw new AppError('A user with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            subscription: {
                create: {
                    plan: 'FREE',
                    status: 'ACTIVE',
                },
            },
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            subscription: true,
        },
    });

    emailService.sendWelcomeEmail(user.email).catch(() => { });

    const token = generateToken(user.id);
    return { user, token };
};

const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true },
    });

    if (!user || !user.passwordHash) {
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            subscription: user.subscription,
        },
        token,
    };
};

const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            subscription: true,
        },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

const generateGoogleToken = (user) => {
    return generateToken(user.id);
};

const forgotPassword = async (email) => {
    if (!email) {
        throw new AppError('Please provide an email address', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError('There is no user with that email address', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            token: hashedToken,
            expiresAt,
        },
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
        await emailService.sendPasswordResetEmail(user.email, resetURL);
    } catch (error) {
        console.error('Error in forgotPassword service:', error);
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

        const message = process.env.NODE_ENV === 'development'
            ? `Email error: ${error.message}`
            : 'There was an error sending the email. Try again later.';

        throw new AppError(message, 500);
    }
};

const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) {
        throw new AppError('Token and new password are required', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
    });

    if (!record || record.expiresAt < new Date()) {
        throw new AppError('Token is invalid or has expired', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
    });

    await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    generateGoogleToken,
    forgotPassword,
    resetPassword,
};
