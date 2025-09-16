const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  reason: { type: String },
});

module.exports = mongoose.model("DoctorLeave", leaveSchema);
