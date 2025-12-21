const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const DoctorLeave = require("../models/DoctorLeave");
const authMiddleware = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const generateAppointmentPDF = require("./generateAppointmentPDF"); // adjust path
const router = express.Router();
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

/* ----------------------------------------
 📌 BOOK APPOINTMENT (STATUS ALWAYS SAVED)
---------------------------------------- */

/* ----------------------------------------
 📌 GET PATIENT APPOINTMENTS
---------------------------------------- */
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
      .select("doctorId patientId date time status createdAt updatedAt") // ✅ include status
      .populate("doctorId", "name department");

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------------------
 📌 GET ALL APPOINTMENTS FOR A DOCTOR
---------------------------------------- */
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId })
      .select("doctorId patientId date time status createdAt updatedAt") // ✅ include status
      .sort({ date: 1, time: 1 })
      .populate("patientId", "name age gender")
      .populate("doctorId", "name department");

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------------------
 📌 GET TODAY'S APPOINTMENTS FOR DOCTOR
---------------------------------------- */
router.get("/doctor/:doctorId/today", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .select("doctorId patientId date time status createdAt updatedAt") // ✅ include status
      .populate("patientId", "name")
      .populate("doctorId", "name department");

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------------------------------------
 📌 GET APPOINTMENTS FOR SPECIFIC DATE
---------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date)
      return res.status(400).json({ error: "doctorId and date are required" });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: start, $lte: end },
    }).select("doctorId patientId date time status createdAt updatedAt"); // ✅ include status

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Get only waiting appointments for a doctor
router.get("/doctor/:doctorId/waiting", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({
    doctorId,
    status: "Pending"
  })
      .sort({ date: 1, time: 1 })
      .populate("patientId", "name");

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching waiting appointments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ----------------------------------------
 📌 UPDATE APPOINTMENT STATUS
---------------------------------------- */
router.put("/:appointmentId/status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true } // return updated document
    )
      .populate("patientId", "name age gender")
      .populate("doctorId", "name department");

    if (!updatedAppointment)
      return res.status(404).json({ error: "Appointment not found" });

    res.json({ message: "Status updated", appointment: updatedAppointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Admin route to get all appointments
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctorId", "name email")
      .populate("patientId", "name email mrNo");
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.post("/book", authMiddleware, async (req, res) => {
  console.log("📌 BODY RECEIVED:", req.body);
  console.log("📌 USER FROM TOKEN:", req.user);

  try {
    // Debug schema status
    console.log(Appointment.schema.paths.status);

    let { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    // Normalize date
    date = new Date(date);

    // Doctor leave check
    const leave = await DoctorLeave.findOne({ doctorId, date });
    if (leave) {
      return res.status(400).json({ error: "Doctor is on leave" });
    }

    // Doctor slot conflict
    const doctorConflict = await Appointment.findOne({ doctorId, date, time });
    if (doctorConflict) {
      return res.status(400).json({ error: "Doctor already booked" });
    }

    // Patient slot conflict
    const patientConflict = await Appointment.findOne({ patientId, date, time });
    if (patientConflict) {
      return res.status(400).json({ error: "You already booked this slot" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      date,
      time,
      status: "Pending", // enum-safe
    });

    // Update user & doctor
    await User.findByIdAndUpdate(patientId, {
      $push: { appointments: appointment._id },
    });

    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { appointments: appointment._id },
    });

    // Populate for PDF
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "name mrNo age gender")
      .populate("doctorId", "name department");

    // Generate PDF
    const pdfPath = await generateAppointmentPDF(populatedAppointment);

    // Final response
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
      pdf: pdfPath,
    });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

module.exports = router;
