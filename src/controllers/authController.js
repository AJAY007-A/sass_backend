const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.registerUser({ email, password });

    res.status(201).json({
        status: 'success',
        token,
        data: { user },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.status(200).json({
        status: 'success',
        token,
        data: { user },
    });
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

const googleCallback = asyncHandler(async (req, res) => {
    const token = authService.generateGoogleToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
});

const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);

    res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email',
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.params.token, req.body.password);

    res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully',
    });
});

module.exports = {
    register,
    login,
    getMe,
    googleCallback,
    forgotPassword,
    resetPassword,
};
