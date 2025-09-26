const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const User = require("../models/User");

// 🔹 Generate truly unique 8-digit PR number
async function generatePRNo() {
  let prNo;
  let exists = true;

  while (exists) {
    prNo = Math.floor(10000000 + Math.random() * 90000000).toString();
    const found = await Prescription.findOne({ prNo });
    if (!found) exists = false;
  }
  return prNo;
}

// 🔍 Search prescriptions by MR No (populate doctor + patient)
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

// 🔍 Fetch patient by MR No (for AddPrescription.js)
router.get("/patient/:mrNo", async (req, res) => {
  try {
    const patient = await User.findOne({ mrNo: req.params.mrNo });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (err) {
    console.error("❌ Error fetching patient:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ➕ Add prescription
router.post("/add", async (req, res) => {
  try {
    const { doctorId, mrNo, ...form } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const patient = await User.findOne({ mrNo });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const prNo = await generatePRNo(); // ✅ unique

    const newPrescription = new Prescription({
      ...form,
      doctor: doctorId,
      patient: patient._id,
      mrNo,
      prNo,
      date: new Date(),
    });

    await newPrescription.save();

    // return with populated doctor + patient for frontend
    const populated = await Prescription.findById(newPrescription._id)
      .populate("doctor", "name email")
      .populate("patient", "name mrNo");

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Error adding prescription:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
