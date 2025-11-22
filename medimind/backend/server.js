// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const doctorAuthRoutes = require("./routes/doctorAuth");
const doctorRoutes = require("./routes/doctorRoutes");
const passwordRoutes = require("./routes/password");
const adminRoutes = require("./routes/adminRoutes");
const patientRoutes = require("./routes/adminpatient");
const appointmentRoutes = require("./routes/appointmentroutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const prescriptionPatientRoutes = require("./routes/prescriptionPatient");
const app = express();

// Frontend URL from .env or default
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "hospital", // Force database to "hospital"
})
  .then(() => console.log("✅ MongoDB connected to 'hospital' database"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// Health check route
app.get("/", (req, res) => {
  res.send("✅ API is running");
});



// Prescriptions
app.use("/api/prescriptions", prescriptionRoutes);
console.log("Prescription routes mounted at /api/prescriptions");

// Prescriptions (Patient-specific)
app.use("/api/patient-prescriptions", prescriptionPatientRoutes);
console.log("Prescription (patient) routes mounted at /api/patient-prescriptions");


// Users
app.use("/api/users", userRoutes);
console.log("User routes mounted at /api/users");

// Authentication
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth");

// Password
app.use("/api/password", passwordRoutes);
console.log("Password routes mounted at /api/password");

// Doctors
app.use("/api/doctors", doctorRoutes); // for doctor data (GET /api/doctors)
console.log("Doctor routes mounted at /api/doctors");
app.use("/api/doctor-auth", doctorAuthRoutes); // for doctor authentication
console.log("Doctor auth routes mounted at /api/doctor-auth");

const departmentRoutes = require("./routes/departmentRoutes");
app.use("/api/departments", departmentRoutes);

// Appointments
app.use("/api/appointments", appointmentRoutes);
console.log("Appointment routes mounted at /api/appointments");

// Admin
app.use("/api/admins", adminRoutes);
console.log("Admin routes mounted at /api/admins");

// Admin - Patients
app.use("/api/adminpatient", patientRoutes);
console.log("Patient routes mounted at /api/adminpatient");

// Remove this duplicate line:
app.use("/api/prescriptions", prescriptionRoutes);
console.log("Prescription routes mounted at /api/prescriptions");

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});