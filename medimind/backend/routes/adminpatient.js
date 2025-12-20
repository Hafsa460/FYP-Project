const express = require("express");
const router = express.Router();
const Patient = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// ---------------- ADMIN TOKEN ----------------
const verifyAdminToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// ---------------- EMAIL SETUP ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Make sure this is App Password if using Gmail 2FA
  },
});

// ---------------- GET ALL PATIENTS ----------------
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GET SINGLE PATIENT ----------------
router.get("/:id", verifyAdminToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- UPDATE PATIENT ----------------
router.put("/:id", verifyAdminToken, async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DELETE PATIENT ----------------
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ADD PATIENT (NO PASSWORD) ----------------
router.post("/add", verifyAdminToken, async (req, res) => {
  try {
    const { name, email, dob, gender } = req.body;

    if (!name || !email || !gender)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await Patient.findOne({ email });
    if (exists) return res.status(400).json({ error: "Patient already exists" });

    const setPasswordToken = crypto.randomBytes(32).toString("hex");

    const patient = new Patient({
      name,
      email,
      dob,
      gender,
      password: null,
      isVerified: false,
      setPasswordToken,
      setPasswordExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await patient.save();

    const link = `${process.env.FRONTEND_URL}/set-password/${setPasswordToken}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Set your patient account password",
      html: `
        <p>Hello ${name},</p>
        <p>Please set your password using the link below:</p>
        <a href="${link}">Set Password</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.json({ message: "Patient added. Set-password email sent." });
  } catch (err) {
    console.error("Add patient error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- SET PASSWORD USING TOKEN ----------------
router.post("/set-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const patient = await Patient.findOne({
      setPasswordToken: req.params.token,
      setPasswordExpires: { $gt: Date.now() },
    });

    if (!patient)
      return res.status(400).json({ error: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);

    patient.password = hashed;
    patient.isVerified = true;
    patient.setPasswordToken = undefined;
    patient.setPasswordExpires = undefined;

    await patient.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
