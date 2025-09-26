const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

// Doctor login route
router.post("/login", async (req, res) => {
  try {
    

    let { pno, password } = req.body;
    console.log("Incoming data:", { pno, password: "[PROVIDED]" });
    if (!pno || !password) {
      return res.status(400).json({ message: "PNO and password are required" });
    }

    pno = Number(pno);
    if (isNaN(pno)) {
      return res.status(400).json({ message: "PNO must be a number" });
    }

    const doctor = await Doctor.findOne({ pno });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: doctor._id, pno: doctor.pno },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Include _id in response
    // ✅ Return _id and department too
    res.status(200).json({
      message: "Login successful",
      token,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        pno: doctor.pno,
        department: doctor.department,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
