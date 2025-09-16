const express = require("express");
const Appointment = require("../models/Appointment");
const DoctorLeave = require("../models/DoctorLeave");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Check constraints
router.post("/check", authMiddleware, async (req, res) => {
  const { doctorId, date, time } = req.body;
  const patientId = req.user.id; // ✅ from token

  try {
    // 1. Check doctor leave
    const leave = await DoctorLeave.findOne({ doctorId, date });
    if (leave) {
      return res.status(400).json({ error: "Doctor is on leave that day." });
    }

    // 2. Check doctor availability
    const doctorConflict = await Appointment.findOne({ doctorId, date, time });
    if (doctorConflict) {
      return res.status(400).json({ error: "Doctor already has an appointment at this time." });
    }

    // 3. Check patient appointment conflict
    const patientConflict = await Appointment.findOne({ patientId, date, time });
    if (patientConflict) {
      return res.status(400).json({ error: "You already have an appointment at this time." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Book appointment
router.post("/book", authMiddleware, async (req, res) => {
  const { doctorId, date, time } = req.body;
  const patientId = req.user.id; // ✅ from token

  try {
    const newAppointment = new Appointment({ doctorId, patientId, date, time });
    await newAppointment.save();
    res.json({ success: true, appointment: newAppointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to book appointment." });
  }
});

module.exports = router;
