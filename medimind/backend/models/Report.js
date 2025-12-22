// models/Report.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  
  caseId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientMrNo: { type: Number, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  doctorPno: { type: Number, required: true },
  images: [{ type: String }], // saved file paths (relative to /uploads)
  feedbacks: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Feedback"
  }
],
  prediction: {
    label: { type: String },
    confidence: { type: Number },
  },
  pdfPath: { type: String }, // saved pdf path
},
 { timestamps: true });

module.exports = mongoose.models.Report || mongoose.model("Report", reportSchema);
