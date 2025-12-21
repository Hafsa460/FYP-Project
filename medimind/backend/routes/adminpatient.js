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
  } catch {
    res.status(400).json({ error: "Invalid token." });
  }
};

// ---------------- EMAIL SETUP ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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

// ---------------- UNIQUE MR NUMBER ----------------
const generateUniqueMRNo = async () => {
  let mrNo, exists = true;
  while (exists) {
    mrNo = Math.floor(100000 + Math.random() * 900000);
    exists = await Patient.findOne({ mrNo });
  }
  return mrNo;
};

router.post("/add", verifyAdminToken, async (req, res) => {
  try {
    const { name, email, dob, gender, password } = req.body;

    if (!name || !email || !gender || !password || !dob)
      return res.status(400).json({ error: "All fields including password are required" });

    const exists = await Patient.findOne({ email });
    if (exists) return res.status(400).json({ error: "Patient already exists" });

    // Age calculation (UNCHANGED)
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const mrNo = await generateUniqueMRNo();

    const patient = new Patient({
      name,
      email,
      dob,
      age,
      gender,
      mrNo,
      password, // ❌ DO NOT hash here, schema pre-save will hash it
      isVerified: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await patient.save();

    const link = `${process.env.FRONTEND_URL}/set-password/${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify account & reset password",
      html: `
        <p>Hello ${name},</p>
        <p>Admin created your account. Please verify and set your password:</p>
        <a href="${link}">Verify & Set Password</a>
        <p>Link expires in 24 hours.</p>
      `,
    });

    res.json({ message: "Patient added successfully. Verification email sent." });
  } catch (err) {
    console.error("Add patient error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- PATIENT SET / RESET PASSWORD ----------------
router.post("/set-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ error: "Password required" });

    const patient = await Patient.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!patient)
      return res.status(400).json({ error: "Invalid or expired token" });

    // set password & verify
    patient.password = password;
    patient.isVerified = true;
    patient.verificationToken = undefined;
    patient.verificationTokenExpires = undefined;

    await patient.save();

    // ✅ SEND CONFIRMATION EMAIL
    await transporter.sendMail({
      to: patient.email,
      subject: "Account Verified Successfully",
      html: `
        <p>Hi ${patient.name},</p>

        <p>Your account has been <strong>verified successfully</strong>.</p>

        <p><strong>Your Username (MR No):</strong> ${patient.mrNo}</p>

        <p>You can now log in using your <strong>MR No</strong> and password.</p>

        <p>Regards,<br/>Hospital Management Team</p>
      `,
    });

    res.json({
      message:
        "Password updated and account verified successfully. Login details sent to email.",
    });
  } catch (err) {
    console.error("Set password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
