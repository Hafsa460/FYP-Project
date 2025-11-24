const express = require("express");
const Department = require("../models/Department");

const router = express.Router();

// GET all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    console.log("📂 Departments fetched:", departments); // 👈 Add this
    res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
