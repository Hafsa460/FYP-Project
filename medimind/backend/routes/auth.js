const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const router = express.Router();

async function loginUser(model, username, password, role, res) {
  try {
    const user = await model.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  loginUser(User, username, password, "user", res);
});

router.post("/loginDoctor", (req, res) => {
  const { username, password } = req.body;
  loginUser(Doctor, username, password, "doctor", res);
});

module.exports = router;
