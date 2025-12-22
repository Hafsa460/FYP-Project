const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
  result: { type: String, required: true },
  givenBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
