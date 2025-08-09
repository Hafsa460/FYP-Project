// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // patients live here

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_me";

// POST /api/auth/login
// Body: { username, password }  -> username can be MR No (number) or email
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    // Decide whether username is MR No (all digits) or email
    const isNumeric = /^\d+$/.test(String(username).trim());
    const query = isNumeric
      ? { mrNo: Number(username) }
      : { email: String(username).trim().toLowerCase() };

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: "Patient not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "patient" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email ?? null,
        mrNo: user.mrNo ?? null,
        name: user.name ?? null,
        role: "patient",
      },
    });
  } catch (err) {
    console.error("[PATIENT LOGIN] error:", err);
    return res.status(500).json({ message: "Server error, try again later" });
  }
});

module.exports = router;
