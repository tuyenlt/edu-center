const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail", // or another provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send a verification email
 */
async function sendVerificationEmail(user) {
    // Create a token (expires in 1 hour)
    console.log("sending email")
    const token = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1h",
    });


    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Verify Your Account",
        html: `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
}

module.exports = { sendVerificationEmail };
