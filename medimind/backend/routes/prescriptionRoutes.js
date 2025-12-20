const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");

// Middleware to verify admin token
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

// 🔹 Generate unique 8-digit PR No
async function generatePRNo() {
  let prNo, exists = true;
  while (exists) {
    prNo = Math.floor(10000000 + Math.random() * 90000000).toString();
    const found = await Prescription.findOne({ prNo });
    if (!found) exists = false;
  }
  return prNo;
}

// 🔍 Search **patient only** (used in AddPrescription.js)
router.get("/patient/:mrNo", async (req, res) => {
  try {
    const patient = await User.findOne({ mrNo: req.params.mrNo });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    console.error("❌ Error searching patient:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Search **prescriptions by MR No** (used in ViewPrescription.js)
router.get("/search/:mrNo", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ mrNo: req.params.mrNo })
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");

    if (!prescriptions.length) {
      return res.status(404).json({ message: "No prescriptions found" });
    }

    res.json(prescriptions);
  } catch (err) {
    console.error("❌ Error searching prescriptions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ➕ Add prescription
router.post("/add", async (req, res) => {
  try {
    const { doctorId, mrNo, ...form } = req.body;

    if (!doctorId) return res.status(400).json({ message: "Doctor ID is required" });

    // 🔍 Check patient
    const patient = await User.findOne({ mrNo });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // 🔍 Check doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // ✅ Generate unique PR No
    const prNo = await generatePRNo();

    // ✅ Create new prescription
    const newPrescription = new Prescription({
      ...form,
      doctor: doctor._id, // ensure ObjectId
      patient: patient._id,
      mrNo,
      prNo,
      date: new Date(),
    });

    await newPrescription.save();

    // ✅ Populate doctor + patient before sending back
    const populated = await Prescription.findById(newPrescription._id)
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");

    res.status(201).json(populated);

  } catch (err) {
    console.error("❌ Error adding prescription:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin route to get all prescriptions
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({})
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");
    res.json(prescriptions);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

module.exports = router;
