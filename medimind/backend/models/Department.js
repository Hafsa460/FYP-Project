const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  doctors: { type: Number, default: 0 },
  nurses: { type: Number, default: 0 },
  others: { type: Number, default: 0 }
});

module.exports = mongoose.model("Department", departmentSchema);
