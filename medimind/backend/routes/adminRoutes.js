// routes/adminRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Admin = require("../models/admin");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const router = express.Router();

// Middleware to verify token and roles
const verifyToken = (roles = []) => (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;

    if (roles.length && !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden: You don't have permission." });
    }

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// ====================
// LOGIN ROUTE
// ====================
router.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) return res.status(400).json({ message: "ID and password required" });

    const admin = await Admin.findOne({ id });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    let isMatch = await bcrypt.compare(password, admin.password);

    // Legacy support: if the password is stored in plain text, hash it on first successful login.
    if (!isMatch && admin.password === password) {
      admin.password = await bcrypt.hash(password, 10);
      await admin.save();
      isMatch = true;
    }

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, role: admin.role, name: admin.name });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin forgot password request
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role === "superAdmin") {
      return res.status(403).json({ message: "Password reset not available for superadmin" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    admin.verificationToken = resetToken;
    admin.verificationTokenExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin-set-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Admin Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Admin Password Reset</h2>
          <p>Hello ${admin.name},</p>
          <p>Click the button below to reset your admin password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background-color:#059da8;color:#ffffff;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>
          <p style="margin-top:20px;font-size:12px;color:#777;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Admin forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Protected route example
router.get("/dashboard", verifyToken(), (req, res) => {
  res.json({ message: `Welcome ${req.admin.name}!`, role: req.admin.role });
});

module.exports = router;
