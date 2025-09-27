// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate unique MR number
async function generateUniqueMrNo() {
  while (true) {
    const mrNo = Math.floor(100000 + Math.random() * 900000);
    const exists = await User.exists({ mrNo });
    if (!exists) return mrNo;
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, name, age, password } = req.body;

    // 1. Validate input
    if (!email || !name || !age || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      return res.status(400).json({ error: "Only Gmail addresses allowed." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // 2. Check existing email
    if (await User.exists({ email })) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // 3. Generate MR No & token
    const mrNo = await generateUniqueMrNo();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    // 4. Save user (password will be hashed automatically by model hook)
    const user = new User({
      email,
      name,
      age,
      mrNo,
      password, // plain password
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });
    await user.save();

    // 5. Send verification email
    const verifyLink = `${BACKEND_URL}/api/users/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your registration",
      html: `
        <p>Hi ${name},</p>
        <p>Click the button below to confirm your registration:</p>
        <p>
          <a href="${verifyLink}" style="display:inline-block;padding:10px 18px;background:#0d9488;color:#fff;border-radius:6px;text-decoration:none;">
            Confirm Registration
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p>${verifyLink}</p>
        <p>This link expires in 24 hours.</p>
      `
    });

    return res.status(201).json({ message: "Verification email sent. Please check your Gmail." });

  } catch (err) {
    console.error("Error in /register:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// VERIFY
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token.");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send MR No email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your account is active — MR No inside",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your account has been verified successfully.</p>
        <p>Your username (MR No) is: <strong>${user.mrNo}</strong></p>
        <p>You can now log in using your MR No and password.</p>
      `
    });

    // Redirect to frontend
    return res.redirect(302, `${FRONTEND_URL}/verify-success?mrNo=${user.mrNo}`);

  } catch (err) {
    console.error("Error in /verify:", err);
    return res.status(500).send("Server error.");
  }
});

// RESEND VERIFICATION
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user with that email found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: "Account is already verified." });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send email
    const verifyLink = `${BACKEND_URL}/api/users/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your registration (Resend)",
      html: `
        <p>Click here to confirm your account:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
      `
    });

    return res.json({ message: "Verification email resent successfully." });

  } catch (err) {
    console.error("Error in /resend-verification:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;
