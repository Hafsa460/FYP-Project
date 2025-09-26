const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  testRecommendation: { type: String, default: "" },
  clinicalSummary: { type: String, default: "" },
  investigation: { type: String, default: "" },
  prescription: { type: String, default: "" },
  diagnosis: { type: String, default: "" },
  followUp: { type: String, default: "" },

  date: { type: Date, default: Date.now }, // auto date
  prNo: { type: String, required: true, unique: true }, // ✅ must be unique

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mrNo: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
