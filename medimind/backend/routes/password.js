// routes/password.js
const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const router = express.Router();

// 🔹 Email transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Send email helper
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// ✅ Request password reset
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    console.log("[Password Reset] Forgot password request for:", email);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.warn("[Password Reset] User not found for:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Generate raw reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 🔹 Hash it for DB storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 🔹 Save hashed token + expiry (skip validation)
    await User.updateOne(
      { _id: user._id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: Date.now() + 3600000, // 1h
      }
    );

    // 🔹 Email reset link with raw token
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    console.log("[Password Reset] Reset URL sent:", resetUrl);

    const plainTextMessage = `Click the link to reset your password: ${resetUrl}`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="
          background-color: #059da8;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 5px;
          display: inline-block;
          margin-top: 10px;
        ">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: gray;">
          If you did not request this, you can ignore this email.
        </p>
      </div>
    `;

    await sendEmail(
      user.email,
      "Password Reset",
      plainTextMessage,
      htmlMessage
    );

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot Password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Reset password using token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    console.log("[Password Reset] Reset request for token:", token);

    // 🔹 Hash the token for lookup
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.warn("[Password Reset] Invalid/expired token:", token);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 🔹 Update password
    user.password = password;

    // 🔹 Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
