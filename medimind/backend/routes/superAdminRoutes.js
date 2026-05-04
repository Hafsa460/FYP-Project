const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate unique 5-digit admin ID
async function generateUniqueAdminId() {
  while (true) {
    const id = Math.floor(10000 + Math.random() * 90000);
    const exists = await Admin.exists({ id });
    if (!exists) return id;
  }
}

// ==========================
// VERIFY SUPER ADMIN
// ==========================
const verifySuperAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superAdmin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    req.admin = decoded;
    next();
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

// ==========================
// GET ALL ADMINS
// ==========================
router.get("/", verifySuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password -verificationToken -verificationTokenExpires");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CREATE ADMIN
// ==========================
router.post("/", verifySuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role, gender } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      return res.status(400).json({ message: "Email must be a valid Gmail address" });
    }

    const emailExists = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const adminId = await generateUniqueAdminId();

    const adminData = {
      id: adminId,
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      gender,
    };

    if (role !== "superAdmin") {
      adminData.isVerified = false;
      adminData.verificationToken = crypto.randomBytes(32).toString("hex");
      adminData.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    } else {
      adminData.isVerified = true;
    }

    const newAdmin = new Admin(adminData);
    await newAdmin.save();

    if (role !== "superAdmin") {
      const setPasswordLink = `${FRONTEND_URL}/admin-set-password/${newAdmin.verificationToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newAdmin.email,
        subject: "Set your admin password",
        html: `
          <p>Hello ${newAdmin.name},</p>
          <p>Your ${newAdmin.role} account has been created.</p>
          <p>Please set your password to activate your account:</p>
          <p>
            <a href="${setPasswordLink}"
               style="display:inline-block;padding:12px 20px;background:#059da8;color:#fff;border-radius:6px;text-decoration:none;">
              Set Password
            </a>
          </p>
          <p>This link expires in 24 hours.</p>
        `,
      });
    }

    res.json({ message: "Admin created", admin: { ...newAdmin.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// UPDATE ADMIN
// ==========================
router.put("/:id", verifySuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role, gender } = req.body;

    const updateData = {
      name,
      role,
      gender,
    };

    if (email) {
      if (!/^[^\s@]+@gmail\.com$/.test(email)) {
        return res.status(400).json({ message: "Email must be a valid Gmail address" });
      }

      const existingEmail = await Admin.findOne({ email: email.toLowerCase().trim(), _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      updateData.email = email.toLowerCase().trim();
    }

    // only hash if password is provided
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updated = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// DELETE ADMIN 
// ==========================
router.delete("/:id", verifySuperAdmin, async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/set-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8+ chars with uppercase, lowercase, number & special char",
      });
    }

    const admin = await Admin.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ error: "Invalid or expired link" });
    }

    admin.password = password;
    admin.isVerified = true;
    admin.verificationToken = undefined;
    admin.verificationTokenExpires = undefined;

    await admin.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Your admin account is activated",
      html: `
        <p>Hi ${admin.name},</p>
        <p>Your ${admin.role} account has been successfully activated.</p>
        <p><strong>Your login credentials:</strong></p>
        <p><strong>Admin ID:</strong> ${admin.id}</p>
        <p>You can now log in using your Admin ID and password.</p>
        <p>Please keep this information secure.</p>
      `,
    });

    res.json({ success: true, message: "Password set successfully. Account activated. Check your email for login credentials." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;