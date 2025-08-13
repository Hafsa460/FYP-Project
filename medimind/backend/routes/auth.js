const express = require("express");
const bcrypt = require("bcryptjs"); // Use bcryptjs consistently
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    let { mrNo, password } = req.body;
    console.log("[Login] Incoming data:", { mrNo, password: "[PROVIDED]" });

    if (!mrNo || !password) {
      return res.status(400).json({ message: "MR No and password are required" });
    }

    // Trim extra spaces
    password = password.trim();

    // Convert MR No to number
    const parsedMrNo = Number(mrNo);
    if (isNaN(parsedMrNo)) {
      return res.status(400).json({ message: "Invalid MR No format" });
    }

    const user = await User.findOne({ mrNo: parsedMrNo });
    if (!user) {
      console.log(`[Login] User not found for MR No: ${parsedMrNo}`);
      return res.status(401).json({ message: "Invalid MR No or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Login] Incorrect password for MR No: ${parsedMrNo}`);
      return res.status(401).json({ message: "Invalid MR No or password" });
    }

    // Create token
    const token = jwt.sign({ id: user._id, mrNo: user.mrNo }, process.env.JWT_SECRET || "yoursecret", {
      expiresIn: "1h",
    });

    console.log(`[Login] Successful login for MR No: ${parsedMrNo}`);
    res.json({
      message: "Login successful",
      token,
      user: {
        mrNo: user.mrNo,
        name: user.name,
        email: user.email,
        age: user.age,
      },
    });
  } catch (err) {
    console.error("[Login] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
