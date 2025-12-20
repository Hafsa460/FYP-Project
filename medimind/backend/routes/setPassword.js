const express = require("express");
const router = express.Router();
const Patient = require("../models/User");
const bcrypt = require("bcryptjs");

router.post("/:token", async (req, res) => {
  const { password } = req.body;

  const patient = await Patient.findOne({
    setPasswordToken: req.params.token,
    setPasswordExpires: { $gt: Date.now() },
  });

  if (!patient)
    return res.status(400).json({ error: "Invalid or expired token" });

  const hashed = await bcrypt.hash(password, 10);

  patient.password = hashed;
  patient.isVerified = true;
  patient.setPasswordToken = undefined;
  patient.setPasswordExpires = undefined;

  await patient.save();

  res.json({ message: "Password set successfully" });
});

module.exports = router;
