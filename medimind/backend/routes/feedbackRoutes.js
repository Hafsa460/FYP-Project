const express = require("express");
const router = express.Router();
const path = require("path");
const Feedback = require("../models/Feedback");
const Report = require("../models/Report");
const fs = require("fs");

// Import generatePdf from same folder
const { generatePdf } = require("./pdfGenerator"); // adjust if inside same folder as feedbackRoutes

// ---------------- Add new feedback ----------------
router.post("/add", async (req, res) => {
  try {
    const { aiReportID, result, givenBy } = req.body;
    if (!aiReportID || !result || !givenBy) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Save feedback
    const feedback = new Feedback({
      report: aiReportID,
      result,
      givenBy,
    });
    await feedback.save();

    // Fetch report to update PDF
    const report = await Report.findById(aiReportID).populate("patient doctor");
    if (report) {
      const pdfPath = path.join(__dirname, "..", "uploads", report.pdfPath);
      const imagePath = path.join(__dirname, "..", "uploads", report.images[0]);

      await generatePdf({
        pdfPath,
        caseId: report.caseId,
        patient: report.patient,
        doctor: report.doctor,
        imagePath,
        label: report.prediction.label,
        confidence: report.prediction.confidence,
        doctorFeedback: result, // Include doctor feedback in PDF
      });
    }

    res.status(201).json({ message: "Feedback saved and PDF updated", feedback });
  } catch (err) {
    console.error("Feedback save error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get all feedbacks for a report ----------------
router.get("/report/:reportId", async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const feedbacks = await Feedback.find({ report: reportId }).sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error("Fetch feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
