const express = require("express");
const Doctor = require("../models/Doctor");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;