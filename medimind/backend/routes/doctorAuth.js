// routes/doctorAuth.js
const express = require("express");
const bcrypt = require("bcrypt"); // ensure this matches your Doctor model
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_me";

/**
 * POST /api/loginDoctor
 * Body: { username, password }
 *  - username is the doctor's email
 */
router.post("/loginDoctor", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    const email = String(username).trim().toLowerCase();
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const ok = await bcrypt.compare(password, doctor.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Shape matches your frontend: token + doctor
    return res.json({
      message: "Login successful",
      token,
      doctor: {
        id: doctor._id,
        email: doctor.email,
        name: doctor.name ?? null,
        role: "doctor",
      },
    });
  } catch (err) {
    console.error("[DOCTOR LOGIN] error:", err);
    return res.status(500).json({ message: "Server error, try again later" });
  }
});

module.exports = router;
