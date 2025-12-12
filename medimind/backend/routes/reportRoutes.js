// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Report = require("../models/Report");

// storage for temporary upload
const tmpUploadDir = path.join(__dirname, "..", "tmp_uploads");
if (!fs.existsSync(tmpUploadDir)) fs.mkdirSync(tmpUploadDir);

const upload = multer({
  dest: tmpUploadDir,
  limits: { fileSize: 30 * 1024 * 1024 }, 
});

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { mrNo, doctorPno } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });
    if (!mrNo || !doctorPno) return res.status(400).json({ success: false, message: "mrNo and doctorPno required" });

    // find patient & doctor
    const patient = await User.findOne({ mrNo: Number(mrNo) });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const doctor = await Doctor.findOne({ pno: Number(doctorPno) });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Forward file to Flask prediction endpoint
    const flaskUrl = process.env.FLASK_PREDICT_URL || "http://127.0.0.1:5000/predict-stroke";

    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path), req.file.originalname);

    const flaskRes = await axios.post(flaskUrl, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const pred = flaskRes.data || {};
    // expected: { success: true, prediction: "Hemorrhage", confidence: 0.92 }
    const label = pred.prediction || pred.label || "Unknown";
    const confidence = typeof pred.confidence === "number" ? pred.confidence : (parseFloat(pred.confidence) || 0);

    // create a case id
    const caseId = `CASE_${new Date().getFullYear()}_${uuidv4().split("-")[0]}`;

    // prepare permanent storage
    const reportsDir = path.join(__dirname, "..", "uploads", "reports", caseId);
    fs.mkdirSync(reportsDir, { recursive: true });

    // move temp file to permanent folder
    const originalExt = path.extname(req.file.originalname) || ".png";
    const savedFileName = `mri${originalExt}`;
    const savedPath = path.join(reportsDir, savedFileName);
    fs.renameSync(req.file.path, savedPath);

    // create PDF
    const pdfPath = path.join(reportsDir, `${caseId}.pdf`);
    await generatePdf({
      pdfPath,
      caseId,
      patient,
      doctor,
      imagePath: savedPath,
      label,
      confidence,
    });

    // Save report doc (paths relative to /uploads)
    const report = new Report({
      caseId,
      patient: patient._id,
      patientMrNo: patient.mrNo,
      doctor: doctor._id,
      doctorPno: doctor.pno,
      images: [path.join("reports", caseId, savedFileName)],
      prediction: { label, confidence },
      pdfPath: path.join("reports", caseId, `${caseId}.pdf`),
    });
    await report.save();

    // Return report data
    res.json({
      success: true,
      report: {
        id: report._id,
        caseId: report.caseId,
        images: report.images,
        prediction: report.prediction,
        pdfPath: report.pdfPath,
      },
    });
  } catch (err) {
    console.error("Error in create report:", err);
    // clean up tmp file if exists
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/patient/:mrNo  -> list reports for MR No
router.get("/patient/:mrNo", async (req, res) => {
  try {
    const mrNo = Number(req.params.mrNo);
    const reports = await Report.find({ patientMrNo: mrNo }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


async function generatePdf({ pdfPath, caseId, patient, doctor, imagePath, label, confidence }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // PAGE 1
      doc.addPage({ size: "A4", margin: 50 });

      // ---- HEADER WITH LOGO ----
      const logoPath = path.join(__dirname, "..", "uploads", "logo.png"); // place logo.png in /uploads
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 });
      }

      doc
        .fontSize(22)
        .text("KRL HOSPITAL ISLAMABAD", 120, 50, { align: "left" });

      doc
        .fontSize(12)
        .text("Diagnostic Imaging Center", 120, 78)
        .text("Tel: 051-1234567\n\n");

      doc.moveDown(2);

      // ---- CASE ID ----
      doc.fontSize(12).text(`Case ID: ${caseId}`, 50, doc.y, { align: "left" });

      doc.moveDown(2);

      // ---- SIDE-BY-SIDE TABLE ----
      const leftX = 50;
      const rightX = 300;
      const startY = doc.y;

      // Title Row
      doc
        .fontSize(14)
        .text("Patient Details", leftX, startY, { underline: true });

      doc
        .fontSize(14)
        .text("Scan Information", rightX, startY, { underline: true },);

      doc.moveDown(1);

      const y2 = doc.y;

      // LEFT column – Patient
      doc.fontSize(12).text(`Name: ${patient.name}`, leftX, y2);
      doc.text(`MR No: ${patient.mrNo}`, leftX);
      if (patient.age) doc.text(`Age: ${patient.age}`, leftX);
      if (patient.gender) doc.text(`Gender: ${patient.gender}`, leftX);

      // RIGHT column – Scan Info
      doc.text(`Scan Name: Brain MRI`, rightX, y2);
      doc.text(`Scan Date: ${new Date().toLocaleDateString()}`, rightX);
      doc.text(`Uploaded By: Dr. ${doctor.name}`, rightX);

// ---- extra spacing before AI table ----
doc.moveDown(6);

// ---- AI ANALYSIS TABLE ----
doc.fontSize(14).text("AI Analysis Result", 50, doc.y, { underline: true, align: "left" });
doc.moveDown(0.8);

// Table Headers
let tableTop = doc.y;
doc.fontSize(12);

doc.text("Scan Name", 50, tableTop);
doc.text("Result", 180, tableTop);
doc.text("Score", 300, tableTop);
doc.text("Date", 400, tableTop);

doc.moveDown(0.5);

// Divider
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

// Table row (aligned)
const score = `${(Number(confidence) * 100).toFixed(2)}%`;

const rowY = doc.y;
doc.text("Brain MRI", 50, rowY);
doc.text(label, 180, rowY);
doc.text(score, 300, rowY);
doc.text(new Date().toLocaleDateString(), 400, rowY);

doc.moveDown(2);

      // ---- MRI IMAGE PAGE ----
      doc.addPage();
      doc.fontSize(16).text("MRI Scan Image", { align: "center", underline: true });
      doc.moveDown(1);

      if (fs.existsSync(imagePath)) {
        try {
          doc.image(imagePath, {
            fit: [480, 480],
            align: "center",
            valign: "center",
          });
        } catch (err) {
          console.log("Image insertion failed:", err.message);
        }
      } else {
        doc.fontSize(14).text("Image not available.");
      }

      doc.moveDown(2);

      // ---- FOOTER ----
      doc.fontSize(10).text(
        "This report was generated by the StrokeAI Detection System.\nIt supports clinical decisions but is not a final diagnosis.",
        { align: "center" }
      );

      doc.end();

      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

