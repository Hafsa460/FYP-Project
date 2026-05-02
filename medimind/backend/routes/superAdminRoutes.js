const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
// VERIFY SUPER ADMIN
// ==========================
const verifySuperAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superAdmin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    req.admin = decoded;
    next();
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};

// ==========================
// GET ALL ADMINS
// ==========================
router.get("/", verifySuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CREATE ADMIN
// ==========================
router.post("/", verifySuperAdmin, async (req, res) => {
  try {
    const { id, name, password, role } = req.body;

    if (!id || !name || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      id,
      name,
      password: hashed,
      role,
    });

    await newAdmin.save();

    res.json({ message: "Admin created", admin: newAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// UPDATE ADMIN
// ==========================
router.put("/:id", verifySuperAdmin, async (req, res) => {
  try {
    const { name, password, role, gender } = req.body;

    const updateData = {
      name,
      role,
      gender,
    };

    // only hash if password is provided
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updated = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// DELETE ADMIN 
// ==========================
router.delete("/:id", verifySuperAdmin, async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;