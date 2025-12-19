const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate unique MR number
async function generateUniqueMrNo() {
  while (true) {
    const mrNo = Math.floor(100000 + Math.random() * 900000);
    const exists = await User.exists({ mrNo });
    if (!exists) return mrNo;
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, name, dob, gender, password } = req.body;

    // 1. Validate input
    if (!email || !name || !dob || !gender || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      return res.status(400).json({ error: "Only Gmail addresses allowed." });
    }
    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({ error: "Invalid gender selection." });
    }

    // Age validation (>=18 years old)
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      return res
        .status(400)
        .json({ error: "You must be at least 18 years old." });
    }

    // Check existing email
    if (await User.exists({ email })) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Generate MR No & token
    const mrNo = await generateUniqueMrNo();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    // Save user
    const user = new User({
      email,
      name,
      dob, // ✅ save DOB
      age, // ✅ calculated above
      gender,
      mrNo,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });
    await user.save();

    // 5. Send verification email
    const verifyLink = `${BACKEND_URL}/api/users/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your registration",
      html: `
        <p>Hi ${name},</p>
        <p>Click the button below to confirm your registration:</p>
        <p>
          <a href="${verifyLink}" style="display:inline-block;padding:10px 18px;background:#0d9488;color:#fff;border-radius:6px;text-decoration:none;">
            Confirm Registration
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return res
      .status(201)
      .json({ message: "Verification email sent. Please check your Gmail." });
  } catch (err) {
    console.error("Error in /register:", err);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});
// Get current logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      dob: user.dob,
      gender: user.gender,
      mrNo: user.mrNo,
    });
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// VERIFY
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token.");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send MR No email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your account is active — MR No inside",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your account has been verified successfully.</p>
        <p>Your username (MR No) is: <strong>${user.mrNo}</strong></p>
        <p>You can now log in using your MR No and password.</p>
      `,
    });

    // Redirect to frontend
    return res.redirect(
      302,
      `${FRONTEND_URL}/verify-success?mrNo=${user.mrNo}`
    );
  } catch (err) {
    console.error("Error in /verify:", err);
    return res.status(500).send("Server error.");
  }
});

// RESEND VERIFICATION
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user with that email found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: "Account is already verified." });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send email
    const verifyLink = `${BACKEND_URL}/api/users/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirm your registration (Resend)",
      html: `
        <p>Click here to confirm your account:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
      `,
    });

    return res.json({ message: "Verification email resent successfully." });
  } catch (err) {
    console.error("Error in /resend-verification:", err);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
});

router.get("/search/:mrNo", async (req, res) => {
  try {
    const { mrNo } = req.params;
    const patient = await User.findOne({ mrNo });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFILE
// UPDATE PROFILE (without password)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name, dob, gender } = req.body;
    const user = await User.findById(req.user.id); // populated by middleware

    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    await user.save();
    res.json({ message: "Profile updated successfully" }); // success message only
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

// REQUEST EMAIL CHANGE
router.post("/request-email-change", async (req, res) => {
  try {
    const { newEmail, mrNo } = req.body;

    // 1. Validate inputs
    if (!newEmail || !/^[^\s@]+@gmail\.com$/.test(newEmail)) {
      return res.status(400).json({ error: "Valid Gmail is required." });
    }
    if (!mrNo) {
      return res.status(400).json({ error: "MR No is required." });
    }

    // 2. Check if email already exists
    const emailExists = await User.exists({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 3. Find user
    const user = await User.findOne({ mrNo });
    if (!user) return res.status(404).json({ error: "Invalid MR No." });

    // 4. Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // 5. Send confirmation email (include newEmail in query)
    const link = `${BACKEND_URL}/api/users/confirm-email/${token}?mrNo=${mrNo}&newEmail=${newEmail}`;
    await transporter.sendMail({
      to: newEmail,
      subject: "Confirm Email Change",
      html: `
        <p>Hello ${user.name},</p>
        <p>Click the button below to confirm your email change:</p>
        <a href="${link}" style="padding:10px 16px;background:#059da8;color:white;border-radius:6px;text-decoration:none;">
          Confirm Change
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return res.json({ message: "Verification email sent successfully." });
  } catch (err) {
    console.error("Error in /request-email-change:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});
const validatePassword = (pwd) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    pwd
  );

// UPDATE PASSWORD
router.put("/update-password", authMiddleware, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // 1️⃣ Check if passwords are provided
    if (!password) return res.status(400).json({ error: "Password is required" });
    if (!confirmPassword)
      return res.status(400).json({ error: "Please confirm your password" });

    // 2️⃣ Check if passwords match
    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match" });

    // 3️⃣ Validate password strength
    if (!validatePassword(password))
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character (@$!%*?&).",
      });

    // 4️⃣ Find user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 5️⃣ Hash password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Password update failed" });
  }
});
// CONFIRM EMAIL CHANGE
router.get("/confirm-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { mrNo, newEmail } = req.query;

    if (!token || !mrNo || !newEmail) {
      return res.status(400).send("Invalid request.");
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
      mrNo,
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token.");
    }

    // Update email
    user.email = newEmail;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    // Return updated user object
    return res.status(200).json({
      message: "Email updated successfully!",
      user: {
        name: user.name,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        mrNo: user.mrNo,
      },
    });
  } catch (err) {
    console.error("Error in /confirm-email:", err);
    return res.status(500).send("Server error.");
  }
});

module.exports = router;
