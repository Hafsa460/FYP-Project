// server.js
// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./models/User")
const patientRoutes = require("./routes/adminpatient");
const app = express();
const adminPatientRoutes = require("./routes/adminpatient");
const authRoutes = require("./routes/auth")
const doctorAuthRoutes = require("./routes/doctorAuth")
const passwordRoutes = require("./routes/password")


// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "hospital"
})
.then(() => console.log("✅ MongoDB connected to 'hospital' database"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Health check
app.get("/", (req, res) => res.send("✅ API is running"));

// Routes
app.use("/api/admin", adminRoutes);
console.log("Admin routes mounted at /api/admin");

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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
