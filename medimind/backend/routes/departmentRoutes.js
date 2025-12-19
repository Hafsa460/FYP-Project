const express = require("express");
const Department = require("../models/Department");

const router = express.Router();

// GET all departments (unchanged)
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW: GET hospital resource summary (for pie chart)
router.get("/summary/resources", async (req, res) => {
  try {
    const departments = await Department.find();

    const summary = departments.reduce(
      (acc, dept) => {
        acc.doctors += dept.doctors || 0;
        acc.nurses += dept.nurses || 0;
        acc.staff += dept.staff || 0;
        acc.rooms += dept.rooms || 0;
        return acc;
      },
      { doctors: 0, nurses: 0, staff: 0, rooms: 0 }
    );

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
