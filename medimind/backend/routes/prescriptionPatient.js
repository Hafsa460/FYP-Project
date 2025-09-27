const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const User = require("../models/User");

// 📌 Get all prescriptions for a patient (using patientId from token or param)

router.get("/patient/:patientId", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate("doctor", "name")
      .populate("patient", "name");

    if (!prescriptions || prescriptions.length === 0) {
      return res.status(404).json({ success: false, message: "No prescriptions found" });
    }

    res.json({ success: true, prescriptions });
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔍 Get single prescription by ID
router.get("/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (err) {
    console.error("❌ Error fetching prescription:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 📌 Get a single prescription by ID (patient view)
router.get("/patient/view/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({ success: true, prescription });
  } catch (err) {
    console.error("❌ Error fetching prescription:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;