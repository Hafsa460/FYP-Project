// backend/routes/doctorAdminRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Admin = require("../models/admin");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate unique PNO
async function generateUniquePno() {
  while (true) {
    const pno = Math.floor(100000 + Math.random() * 900000);
    const exists = await Doctor.exists({ pno });
    if (!exists) return pno;
  }
}

// Helper: verify admin token inline
async function requireAdmin(req, res) {
  try {
    const header = req.header("Authorization");
    if (!header) return { error: "No token provided", status: 401 };

    const token = header.replace("Bearer ", "").trim();
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return { error: "Invalid token", status: 401 };
    }

    // find admin - adjust field if your Admin model stores _id instead of id
    const admin = await Admin.findOne({ id: decoded.id }).select("-password");
    if (!admin) return { error: "Admin not found", status: 403 };

    if (!(admin.role === "doctorAdmin" || admin.role === "superAdmin")) {
      return { error: "Access denied: not doctor admin", status: 403 };
    }

    return { admin, decoded };
  } catch (err) {
    console.error("requireAdmin error:", err);
    return { error: "Server error", status: 500 };
  }
}

// Overview: totals, appointment status breakdown, prescriptions total, doctorsByDept
router.get("/overview", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const totalDoctors = await Doctor.countDocuments({ active: true });
    const totalAppointments = await Appointment.countDocuments();

    // appointment status counts (normalize keys to lowercase)
    const apptStatusAgg = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const apptStatus = {};
    apptStatusAgg.forEach(a => {
      const key = (a._id || "unknown").toString();
      apptStatus[key.toLowerCase()] = a.count;
    });

    const totalPrescriptions = await Prescription.countDocuments();

    const doctorsByDept = await Doctor.aggregate([
      { $match: { active: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      totalDoctors,
      totalAppointments,
      apptStatus,
      totalPrescriptions,
      doctorsByDept,
    });
  } catch (err) {
    console.error("overview error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET doctors (active by default, but can filter)
router.get("/doctors", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const { name, department, designation, active } = req.query;
    const q = {};
    if (name) q.name = { $regex: name, $options: "i" };
    if (department) q.department = { $regex: department, $options: "i" };
    if (designation) q.designation = { $regex: designation, $options: "i" };
    if (active !== undefined) q.active = active === "true";
    // If active not specified, default to true for active doctors

    const doctors = await Doctor.find(q).select("-password").lean();

    // safe-guard: if no doctors, return empty list
    if (!doctors || doctors.length === 0) {
      return res.json({ success: true, doctors: [] });
    }

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

// GET single doctor
router.get("/doctor/:id", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const doctorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, error: "Invalid doctor id" });

    const doctor = await Doctor.findById(doctorId).select("-password").lean();
    if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found" });

    res.json({ success: true, doctor });
  } catch (err) {
    console.error("doctor detail error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET doctor stats (unchanged logic but robust)
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
      ...patientsFromAppt.map((id) => id?.toString()).filter(Boolean),
      ...patientsFromPres.map((id) => id?.toString()).filter(Boolean),
    ]);

    const patientIds = Array.from(patientIdsSet).map((id) => new mongoose.Types.ObjectId(id));
    const totalPatients = patientIds.length;

    let genderStats = { male: 0, female: 0, unknown: 0 };
    if (patientIds.length > 0) {
      const genders = await User.aggregate([
        { $match: { _id: { $in: patientIds } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]);
      genders.forEach((g) => {
        const key = (g._id || "unknown").toString().toLowerCase();
        genderStats[key] = g.count;
      });
    }

    const recentAppointments = await Appointment.find({ doctorId })
      .sort({ date: -1 })
      .limit(5)
      .populate("patientId", "name age gender")
      .lean();

    const doctor = await Doctor.findById(doctorId)
      .select("department designation workingHours name gender createdAt")
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

// CREATE doctor
router.post("/doctor", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const { name, email, password, department, designation, gender, leaveDays, workingHours } = req.body;
    if (!name || !email || !password || !department || !designation || !gender) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      return res.status(400).json({ success: false, error: "Email must be a valid Gmail address" });
    }

    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(400).json({ success: false, error: "Doctor with this email already exists" });

    // Generate PNO and token
    const pno = await generateUniquePno();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const newDoc = new Doctor({
      name,
      email,
      pno,
      password,
      department,
      designation,
      gender,
      leaveDays: leaveDays || [],
      workingHours: workingHours || { start: "08:00", end: "14:00" },
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      tempPassword: password, // Store plain text temporarily
    });

    await newDoc.save();

    // Send verification email
    const verifyLink = `${BACKEND_URL}/api/doctor-admin/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your doctor registration",
      html: `
        <p>Hi ${name},</p>
        <p>Click the button below to confirm your registration:</p>
        <p>
          <a href="${verifyLink}" style="display:inline-block;padding:10px 18px;background:#0d9488;color:#fff;border-radius:6px;text-decoration:none;">
            Confirm Registration
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
        <p>Please keep this information secure.</p>
      `,
    });

    res.json({ success: true, doctor: { ...newDoc.toObject(), password: undefined }, message: "Doctor added and verification email sent" });
  } catch (err) {
    console.error("create doctor error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// UPDATE doctor
router.put("/doctor/:id", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const doctorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, error: "Invalid doctor id" });

    // Prevent password update here (or if included, hash it)
    const update = { ...req.body };
    delete update.password;

    const updated = await Doctor.findByIdAndUpdate(doctorId, update, { new: true }).select("-password").lean();
    if (!updated) return res.status(404).json({ success: false, error: "Doctor not found" });

    res.json({ success: true, doctor: updated });
  } catch (err) {
    console.error("update doctor error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// DELETE doctor (soft-delete)
router.delete("/doctor/:id", async (req, res) => {
  const check = await requireAdmin(req, res);
  if (check.error) return res.status(check.status).json({ error: check.error });

  try {
    const doctorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, error: "Invalid doctor id" });

    const updated = await Doctor.findByIdAndUpdate(doctorId, { active: false }, { new: true }).select("-password").lean();
    if (!updated) return res.status(404).json({ success: false, error: "Doctor not found" });

    return res.json({ success: true, message: "Doctor deactivated", doctor: updated });
  } catch (err) {
    console.error("delete doctor error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// REACTIVATE doctor
router.post("/doctor/:id/reactivate", async (req, res) => {
  console.log(`Reactivate request for doctor ID: ${req.params.id}`);
  const check = await requireAdmin(req, res);
  if (check.error) {
    console.log('Admin check failed:', check.error);
    return res.status(check.status).json({ error: check.error });
  }

  try {
    const doctorId = req.params.id;
    console.log('Processing reactivation for doctor:', doctorId);

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      console.log('Invalid doctor ID:', doctorId);
      return res.status(400).json({ success: false, error: "Invalid doctor id" });
    }

    const updated = await Doctor.findByIdAndUpdate(doctorId, { active: true }, { new: true }).select("-password").lean();
    if (!updated) {
      console.log('Doctor not found:', doctorId);
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }

    console.log('Doctor reactivated successfully:', updated.name);
    return res.json({ success: true, message: "Doctor reactivated successfully", doctor: updated });
  } catch (err) {
    console.error("reactivate doctor error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// notifications unchanged
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
        message: `${a.patientId?.name || "Patient"} has appointment with Dr. ${a.doctorId?.name || ""} on ${new Date(a.date).toLocaleDateString()} ${a.time}`,
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

// VERIFY DOCTOR
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const doctor = await Doctor.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!doctor) {
      return res.status(400).send("Invalid or expired token.");
    }

    doctor.isVerified = true;
    doctor.verificationToken = undefined;
    doctor.verificationTokenExpires = undefined;
    await doctor.save();

    // Send PNO email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: doctor.email,
      subject: "Your doctor account is active — Login credentials inside",
      html: `
        <p>Hi ${doctor.name},</p>
        <p>Your account has been verified successfully.</p>
        <p><strong>Your login credentials:</strong></p>
        <p><strong>PNO:</strong> ${doctor.pno}</p>
        <p><strong>Password:</strong> ${doctor.tempPassword}</p>
        <p>You can now log in using your PNO and password.</p>
        <p>Please keep this information secure.</p>
      `,
    });

    // Clear temporary password after sending email
    doctor.tempPassword = undefined;
    await doctor.save();

    // Redirect to frontend
    return res.redirect(
      302,
      `${FRONTEND_URL}/doctor-verify-success?pno=${doctor.pno}`
    );
  } catch (err) {
    console.error("Error in /verify:", err);
    return res.status(500).send("Server error.");
  }
});

// RESEND VERIFICATION FOR DOCTOR
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    if (doctor.isVerified) {
      return res.status(400).json({ error: "Doctor already verified" });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    doctor.verificationToken = verificationToken;
    doctor.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await doctor.save();

    // Send email
    const verifyLink = `${BACKEND_URL}/api/doctor-admin/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your doctor registration (Resend)",
      html: `
        <p>Click here to confirm your account:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
      `,
    });

    return res.json({ message: "Verification email resent successfully." });
  } catch (err) {
    console.error("Error in /resend-verification:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;
