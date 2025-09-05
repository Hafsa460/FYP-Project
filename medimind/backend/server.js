// server.js
// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctorAuth");
const passwordRoutes = require("./routes/password");

// ⬇️ Import your new admin routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./models/User")
const patientRoutes = require("./routes/adminpatient");
const app = express();
const adminPatientRoutes = require("./routes/adminpatient");
const authRoutes = require("./routes/auth")
const doctorAuthRoutes = require("./routes/doctorAuth")
const passwordRoutes = require("./routes/password")


// Frontend URL from .env or default
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
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
  dbName: "hospital" // Force database to "hospital"
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

// After importing routes

app.use("/api/users", userRoutes);
console.log("User routes mounted at /api/users");

app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth");

app.use("/api/password", passwordRoutes);
console.log("Password routes mounted at /api/password");

app.use("/api/doctors", doctorRoutes);
console.log("Doctor routes mounted at /api/doctors");

// ⬇️ Mount the admin routes here
app.use("/api/admins", adminRoutes);
console.log("Admin routes mounted at /api/admins");

// After importing routes

app.use("/api/users", userRoutes);
console.log("User routes mounted at /api/users");

app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth");

app.use("/api", doctorAuthRoutes);
console.log("Doctor auth routes mounted at /api");

app.use("/api/password", passwordRoutes);
console.log("Password routes mounted at /api/password");

app.use("/api/adminpatients", adminPatientRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
