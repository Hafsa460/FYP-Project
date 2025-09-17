const express = require("express");
const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Doctor login route
router.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body); // Debug

    let { pno, password } = req.body;

    // Validate input
    if (!pno || !password) {
      return res.status(400).json({ message: "PNO and password are required" });
    }

    // Ensure PNO is a number
    pno = Number(pno);
    if (isNaN(pno)) {
      return res.status(400).json({ message: "PNO must be a number" });
    }

    // Find doctor by PNO
    const doctor = await Doctor.findOne({ pno });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Compare password
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { id: doctor._id, pno: doctor.pno },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      doctor: { name: doctor.name, email: doctor.email, pno: doctor.pno },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
