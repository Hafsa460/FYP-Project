// routes/prescriptionRoutes.js
const express = require("express");
const Prescription = require("../models/Prescription");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const prescriptions = await Prescription.find({ patient: userId })
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");

    if (!prescriptions || prescriptions.length === 0) {
      return res.status(404).json({ message: "No prescriptions found" });
    }

    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
