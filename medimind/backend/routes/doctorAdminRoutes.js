// backend/routes/doctorAdminRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const router = express.Router();

// require models (use the same filenames you already have)
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Admin = require("../models/admin"); // note: your model file name is admin.js

// -------------------------
// Helper: verify admin token inline (no external middleware)
// -------------------------
async function requireAdmin(req, res) {
  try {
    const header = req.header("Authorization");
    if (!header) return { error: "No token provided", status: 401 };

    const token = header.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return { error: "Invalid token", status: 401 };
    }

    // decoded contains { id: admin.id, name, role } (as issued in your admin login)
    // find admin in DB by numeric id field
    const admin = await Admin.findOne({ id: decoded.id }).select("-password");
    if (!admin) return { error: "Admin not found", status: 403 };

    // only doctorAdmin or superAdmin allowed
    if (!(admin.role === "doctorAdmin" || admin.role === "superAdmin")) {
      return { error: "Access denied: not doctor admin", status: 403 };
    }

    return { admin, decoded };
  } catch (err) {
    console.error("requireAdmin error:", err);
    return { error: "Server error", status: 500 };
  }
}

// -------------------------
// ROUTES
// -------------------------

// GET /api/doctor-admin/overview
router.get("/overview", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const doctorsByDept = await Doctor.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } },
    ]);

    const doctorsPerAdmin = []; // placeholder

    res.json({
      success: true,
      totalDoctors,
      totalAppointments,
      doctorsByDept,
      doctorsPerAdmin,
    });
  } catch (err) {
    console.error("overview error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/doctor-admin/doctors
router.get("/doctors", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const { name, department, designation } = req.query;
    const q = {};
    if (name) q.name = { $regex: name, $options: "i" };
    if (department) q.department = { $regex: department, $options: "i" };
    if (designation) q.designation = { $regex: designation, $options: "i" };

    const doctors = await Doctor.find(q).select("-password").lean();
    const ids = doctors.map((d) => d._id);
    const counts = await Appointment.aggregate([
      { $match: { doctorId: { $in: ids } } },
      { $group: { _id: "$doctorId", count: { $sum: 1 } } },
    ]);

    const countsMap = {};
    counts.forEach((c) => {
      countsMap[c._id.toString()] = c.count;
    });

    const doctorsWithCounts = doctors.map((d) => ({
      ...d,
      appointmentCount: countsMap[d._id.toString()] || 0,
    }));

    res.json({ success: true, doctors: doctorsWithCounts });
  } catch (err) {
    console.error("doctors error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/doctor-admin/doctor/:id
router.get("/doctor/:id", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const doctorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, error: "Invalid doctor id" });

    const doctor = await Doctor.findById(doctorId).select("-password").lean();
    if (!doctor)
      return res.status(404).json({ success: false, error: "Doctor not found" });

    res.json({ success: true, doctor });
  } catch (err) {
    console.error("doctor detail error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ FIXED HERE — GET /api/doctor-admin/doctor/:id/stats
router.get("/doctor/:id/stats", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const doctorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, error: "Invalid doctor id" });

    const totalAppointments = await Appointment.countDocuments({ doctorId });
    const totalPrescriptions = await Prescription.countDocuments({ doctor: doctorId });

    const patientsFromAppt = await Appointment.distinct("patientId", { doctorId });
    const patientsFromPres = await Prescription.distinct("patient", { doctor: doctorId });

    const patientIdsSet = new Set([
      ...patientsFromAppt.map((id) => id.toString()),
      ...patientsFromPres.map((id) => id.toString()),
    ]);

    // ✅ FIXED ObjectId creation
    const patientIds = Array.from(patientIdsSet).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const totalPatients = patientIds.length;

    let genderStats = { Male: 0, Female: 0, Unknown: 0 };
    if (patientIds.length > 0) {
      const genders = await User.aggregate([
        { $match: { _id: { $in: patientIds } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]);
      genders.forEach((g) => {
        const key = g._id || "Unknown";
        genderStats[key] = g.count;
      });
    }

    const recentAppointments = await Appointment.find({ doctorId })
      .sort({ date: -1 })
      .limit(5)
      .populate("patientId", "name age gender")
      .lean();

    const doctor = await Doctor.findById(doctorId)
      .select("department designation workingHours name gender")
      .lean();

    res.json({
      success: true,
      stats: {
        totalAppointments,
        totalPrescriptions,
        totalPatients,
        genderStats,
        recentAppointments,
        doctorInfo: doctor || null,
      },
    });
  } catch (err) {
    console.error("doctor stats error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/doctor-admin/search
router.get("/search", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const { term, department, designation } = req.query;
    const q = {};
    if (term)
      q.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { pno: { $regex: term, $options: "i" } },
      ];
    if (department) q.department = { $regex: department, $options: "i" };
    if (designation) q.designation = { $regex: designation, $options: "i" };

    const doctors = await Doctor.find(q).select("-password").lean();
    res.json({ success: true, doctors });
  } catch (err) {
    console.error("search error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/doctor-admin/notifications
router.get("/notifications", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const todaysAppointments = await Appointment.find({
      date: { $gte: startOfDay },
    })
      .sort({ date: 1 })
      .limit(10)
      .populate("doctorId", "name")
      .populate("patientId", "name")
      .lean();

    const notifications = [];

    todaysAppointments.forEach((a) => {
      notifications.push({
        type: "appointment",
        message: `${a.patientId?.name || "Patient"} has appointment with Dr. ${
          a.doctorId?.name || ""
        } on ${new Date(a.date).toLocaleDateString()} ${a.time}`,
        createdAt: a.date,
      });
    });

    notifications.push({
      type: "info",
      message: "No pending doctor edit requests (placeholder)",
      createdAt: new Date(),
    });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("notifications error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ success: false, error: check.error });

  res.json({ success: true, admin: check.admin });
});

module.exports = router;
