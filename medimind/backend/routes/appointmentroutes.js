const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User"); 
const Doctor = require("../models/Doctor");
const DoctorLeave = require("../models/DoctorLeave");
const authMiddleware = require("../middleware/auth");


const router = express.Router();

router.post("/book", authMiddleware, async (req, res) => {
  try {
    let { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    // convert date string -> Date
    date = new Date(date);

    // doctor leave check
    const leave = await DoctorLeave.findOne({ doctorId, date });
    if (leave) return res.status(400).json({ error: "Doctor is on leave" });

    // doctor conflict
    const doctorConflict = await Appointment.findOne({ doctorId, date, time });
    if (doctorConflict)
      return res.status(400).json({ error: "Doctor already booked" });

    // patient conflict
    const patientConflict = await Appointment.findOne({ patientId, date, time });
    if (patientConflict)
      return res.status(400).json({ error: "You already booked this slot" });

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      date,
      time,
    });

    await User.findByIdAndUpdate(patientId, {
      $push: { appointments: appointment._id },
    });
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { appointments: appointment._id },
    });

    res.status(201).json({ message: "✅ Appointment booked", appointment });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});



router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name department"); 

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Get ALL appointments for a doctor
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId })
      .sort({ date: 1, time: 1 })
      .populate("patientId", "name age gender")
      .populate("doctorId", "name department");

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching doctor's appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/doctor/:doctorId/today", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate("patientId", "name")
      .populate("doctorId", "name department");

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching today’s appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
