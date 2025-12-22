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

const tmpUploadDir = path.join(__dirname, "..", "tmp_uploads");
if (!fs.existsSync(tmpUploadDir)) fs.mkdirSync(tmpUploadDir);

const upload = multer({ dest: tmpUploadDir, limits: { fileSize: 30 * 1024 * 1024 } });

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { mrNo, doctorPno } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });
    if (!mrNo || !doctorPno) return res.status(400).json({ success: false, message: "mrNo and doctorPno required" });

    const patient = await User.findOne({ mrNo: Number(mrNo) });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const doctor = await Doctor.findOne({ pno: Number(doctorPno) });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // ---------- CALL FLASK ----------
    const flaskUrl = process.env.FLASK_PREDICT_URL || "http://127.0.0.1:5000/predict-stroke";
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path), req.file.originalname);

    const flaskRes = await axios.post(flaskUrl, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const { prediction, confidence } = flaskRes.data;

    // ---------- CREATE CASE ----------
    const caseId = `CASE_${new Date().getFullYear()}_${uuidv4().split("-")[0]}`;
    const reportsDir = path.join(__dirname, "..", "uploads", "reports", caseId);
    fs.mkdirSync(reportsDir, { recursive: true });

    // ---------- SAVE MRI ----------
    const ext = path.extname(req.file.originalname) || ".png";
    const mriName = `mri${ext}`;
    const mriPath = path.join(reportsDir, mriName);
    fs.renameSync(req.file.path, mriPath);

    // ---------- GENERATE PDF ----------
    const pdfPath = path.join(reportsDir, `${caseId}.pdf`);
    await generatePdf({
      pdfPath,
      caseId,
      patient,
      doctor,
      imagePath: mriPath,
      label: prediction,
      confidence
    });

    // ---------- SAVE DB ----------
    const report = new Report({
      caseId,
      patient: patient._id,
      patientMrNo: patient.mrNo,
      doctor: doctor._id,
      doctorPno: doctor.pno,
      images: [path.join("reports", caseId, mriName)],
      prediction: { label: prediction, confidence },
      pdfPath: path.join("reports", caseId, `${caseId}.pdf`)
    });

    await report.save();

    res.json({
      success: true,
      report: {
        id: report._id,
        caseId,
        images: report.images,
        prediction: report.prediction,
        pdfPath: report.pdfPath
      }
    });

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/patient/:mrNo", async (req, res) => {
  try {
    const mrNo = Number(req.params.mrNo);
    const reports = await Report.find({ patientMrNo: mrNo }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

async function generatePdf({
  pdfPath,
  caseId,
  patient,
  doctor,
  imagePath,
  label,
  confidence,
  doctorFeedback // NEW
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // PAGE 1
      doc.addPage({ size: "A4", margin: 50 });

      const logoPath = path.join(__dirname, "..", "uploads", "logo.png");
      if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 40, { width: 60 });

      doc.fontSize(22).text("KRL HOSPITAL ISLAMABAD", 120, 50, { align: "left" });
      doc.fontSize(12).text("Diagnostic Imaging Center\nTel: 051-1234567\n\n", 120, 78);

      doc.fontSize(12).text(`Case ID: ${caseId}`, 50, doc.y);

      // Patient & Scan info
      const leftX = 50, rightX = 300, startY = doc.y + 20;
      doc.fontSize(14).text("Patient Details", leftX, startY, { underline: true });
      doc.fontSize(14).text("Scan Information", rightX, startY, { underline: true });

      const y2 = doc.y + 5;
      doc.fontSize(12).text(`Name: ${patient.name}`, leftX, y2);
      doc.text(`MR No: ${patient.mrNo}`, leftX);
      if (patient.age) doc.text(`Age: ${patient.age}`, leftX);
      if (patient.gender) doc.text(`Gender: ${patient.gender}`, leftX);

      doc.text(`Scan Name: Brain MRI`, rightX, y2);
      doc.text(`Scan Date: ${new Date().toLocaleDateString()}`, rightX);
      doc.text(`Uploaded By: Dr. ${doctor.name}`, rightX);

      // AI Analysis Table
  doc.moveDown(6);
doc.fontSize(14).text("AI Analysis Result", 50, doc.y, { underline: true });
doc.moveDown(0.8);

// ---- Table Headers ----
const tableTop = doc.y;
doc.fontSize(12).text("Scan Name", 50, tableTop);
doc.text("Result", 250, tableTop); // adjusted X
doc.text("Date", 400, tableTop);   // adjusted X

doc.moveDown(0.5);

// ---- Divider line ----
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

// ---- Table row ----
const rowY = doc.y;
doc.fontSize(12).text("Brain MRI", 50, rowY);
doc.text(label, 250, rowY);
doc.text(new Date().toLocaleDateString(), 400, rowY);

doc.moveDown(2);
      doc.fontSize(14).text("Doctor Feedback", 50, doc.y, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(
        doctorFeedback ? doctorFeedback : "Not submitted yet",
        { align: "left" }
      );

      // PAGE 2: MRI
      doc.addPage();
      doc.fontSize(16).text("Original MRI Image", { align: "center", underline: true });
      doc.moveDown(1);
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, { fit: [480, 480], align: "center" });
      }

      doc.end();
      stream.on("finish", resolve);
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}
