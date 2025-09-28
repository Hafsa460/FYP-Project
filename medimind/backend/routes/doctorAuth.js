const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const User = require("../models/User"); // ✅ For gender stats

// ======================= LOGIN =======================
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

    res.status(200).json({
  message: "Login successful",
  token,
  doctor: {
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    pno: doctor.pno,
    department: doctor.department,
    designation: doctor.designation, // ✅ added
    gender: doctor.gender, // ✅ added
  },
});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================= GET ALL DOCTORS =======================
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.json({ success: true, doctors });
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ======================= GET LOGGED-IN DOCTOR =======================
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const doctor = await Doctor.findById(decoded.id).select("-password");
if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found" });

res.json({
  success: true,
  doctor: {
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    pno: doctor.pno,
    department: doctor.department,
    designation: doctor.designation, // ✅ added
    gender: doctor.gender, // ✅ added
  }
});
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ success: false, error: "Invalid token" });
  }
});

// ======================= GET DOCTOR BY ID =======================
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, doctor });
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ======================= GET DOCTOR STATS =======================
// ======================= GET DOCTOR STATS =======================
router.get("/:id/stats", async (req, res) => {
  try {
    const doctorId = req.params.id;

    const totalAppointments = await Appointment.countDocuments({ doctorId });

    const now = new Date();
    const upcomingAppointments = await Appointment.countDocuments({
      doctorId,
      date: { $gte: now },
    });

    const patients = await Appointment.distinct("patientId", { doctorId });
    const totalPatients = patients.length;

    const totalPrescriptions = await Prescription.countDocuments({ doctor: doctorId });

    // ✅ Always normalize and ensure keys exist
    const patientDocs = await User.find({ _id: { $in: patients } });
    let maleCount = 0, femaleCount = 0;
    patientDocs.forEach(p => {
      if (p.gender?.toLowerCase() === "male") maleCount++;
      if (p.gender?.toLowerCase() === "female") femaleCount++;
    });

    const genderStats = { male: maleCount, female: femaleCount };

    const verifiedReports = 0; // placeholder
    console.log("Patients found:", patientDocs.map(p => ({ name: p.name, gender: p.gender })));
    res.json({
      success: true,
      stats: {
        totalAppointments,
        upcomingAppointments,
        totalPatients,
        totalPrescriptions,
        genderStats,
        verifiedReports,
      },
    });
  } catch (err) {
    console.error("Error fetching doctor stats:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ======================= UPCOMING APPOINTMENTS =======================
router.get("/:id/upcoming", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const now = new Date();
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: now },
    }).populate("patientId", "name age gender");
    res.json({ success: true, appointments });
  } catch (err) {
    console.error("Error fetching upcoming appointments:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ======================= DOCTOR'S PRESCRIPTIONS =======================
router.get("/:id/prescriptions", async (req, res) => {
  try {
    const doctorId = req.params.id;
    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate("patient", "name mrNo");
    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
