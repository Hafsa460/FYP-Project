const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, name, age, mrNo, password } = req.body;

    // Check if MR No or Email already exists
    const existingEmail = await User.findOne({ email });
    const existingMrNo = await User.findOne({ mrNo });

    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered." });
    }
    if (existingMrNo) {
      return res.status(400).json({ error: "MR No already registered." });
    }

    const newUser = new User({ email, name, age, mrNo, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
