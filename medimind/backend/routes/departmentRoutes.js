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

// POST create a new department
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }
    const department = new Department({ name, description });
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update a department
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, doctors, nurses, staff, rooms } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }
    const updated = await Department.findByIdAndUpdate(
      id,
      {
        name,
        description,
        doctors: Number(doctors) || 0,
        nurses: Number(nurses) || 0,
        staff: Number(staff) || 0,
        rooms: Number(rooms) || 0,
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Department not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a department
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
