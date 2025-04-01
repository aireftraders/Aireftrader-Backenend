const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USERNAME,
    pass: config.EMAIL_PASSWORD
  }
});

const emailService = {
  sendVerificationEmail: async (email, token) => {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: config.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your Email for AI REF-TRADERS',
      html: `
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  },

  sendPasswordResetEmail: async (email, token) => {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.EMAIL_USERNAME,
      to: email,
      subject: 'Password Reset Request for AI REF-TRADERS',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }
};

module.exports = emailService;