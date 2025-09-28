// routes/adminRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const router = express.Router();

// Middleware to verify token and roles
const verifyToken = (roles = []) => (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;

    if (roles.length && !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden: You don't have permission." });
    }

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// ====================
// LOGIN ROUTE
// ====================
router.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) return res.status(400).json({ message: "ID and password required" });

    const admin = await Admin.findOne({ id });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, role: admin.role, name: admin.name });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Protected route example
router.get("/dashboard", verifyToken(), (req, res) => {
  res.json({ message: `Welcome ${req.admin.name}!`, role: req.admin.role });
});

module.exports = router;
