const resend = require('../config/resend');
const AppError = require('../utils/AppError');

const sendEmail = async ({ to, subject, html }) => {
  const data = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to,
    subject,
    html,
  });
  return data;
};

const sendWelcomeEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Our Platform! 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#6c63ff;">Welcome aboard!</h1>
        <p>Thanks for signing up. You now have access to a <strong>free plan</strong>.</p>
        <p>Explore your dashboard and upgrade anytime to unlock premium features.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#888;font-size:12px;">If you did not create this account, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, resetURL) => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#6c63ff;">Reset your password</h1>
        <p>Click the button below to set a new password. This link expires in <strong>10 minutes</strong>.</p>
        <a href="${resetURL}" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0;">Reset Password</a>
        <p style="word-break:break-all;color:#666;font-size:13px;">Or copy this link: ${resetURL}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#888;font-size:12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
};

const sendSubscriptionEmail = async (email, plan) => {
  await sendEmail({
    to: email,
    subject: `You're now on the ${plan} plan! 🚀`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#6c63ff;">Subscription Activated</h1>
        <p>Your <strong>${plan}</strong> plan is now active. Enjoy all the premium features!</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#888;font-size:12px;">Manage your subscription from your dashboard at any time.</p>
      </div>
    `,
  });
};

const sendCancellationEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: 'Subscription Canceled',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#e74c3c;">Subscription Canceled</h1>
        <p>Your subscription has been canceled. You can re-subscribe anytime from your dashboard.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#888;font-size:12px;">We'd love to have you back!</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSubscriptionEmail,
  sendCancellationEmail,
};
