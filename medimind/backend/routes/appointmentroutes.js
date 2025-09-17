const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User"); 
const Doctor = require("../models/Doctor");
const DoctorLeave = require("../models/DoctorLeave");
const authMiddleware = require("../middleware/auth");


const router = express.Router();

router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id; // from token

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

    // 4. Create appointment
    const appointment = await Appointment.create({ doctorId, patientId, date, time });

    // 5. Save appointment ID in patient
    await User.findByIdAndUpdate(patientId, {
      $push: { appointments: appointment._id }
    });

    // 6. Save appointment ID in doctor
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { appointments: appointment._id }
    });

    res.status(201).json({
      message: "✅ Appointment booked successfully",
      appointment
    });

  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});
module.exports = router;
