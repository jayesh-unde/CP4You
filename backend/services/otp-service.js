const crypto = require('crypto');
const hashService = require('./hash-service');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// Configure the transporter for email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class OtpService {
    async generateOtp() {
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }

    async sendByEmail(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code for JeeCode is ${otp}. It will expire in 3 minutes.`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}`);
        } catch (error) {
            console.error(`Failed to send OTP to ${email}: `, error);
            throw new Error('Failed to send OTP');
        }
    }

    verifyOtp(hashOtp, data) {
        let computedHash = hashService.hashOtp(data);
        if (computedHash === hashOtp) { // check whether otp is valid or not
            return true;
        }
        return false;
    }
}

module.exports = new OtpService();
