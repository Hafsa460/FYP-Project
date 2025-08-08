const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, age, username, password } = req.body;

    // Check if CNIC is already registered
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "CNIC already registered." });
    }

    const newUser = new User({ name, age, username, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
