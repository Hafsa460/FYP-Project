// models/admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["doctorAdmin", "patientAdmin", "departmentAdmin", "superAdmin"],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
