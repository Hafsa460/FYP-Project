const express = require("express");
const Doctor = require("../models/Doctor");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors); // Return array, not object
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});
router.get("/:doctorId/upcoming", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
      date: { $gte: new Date() },
    })
      .populate("patientId", "name")
      .sort({ date: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;