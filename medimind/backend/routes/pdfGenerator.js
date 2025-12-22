const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generatePdf({
  pdfPath,
  caseId,
  patient,
  doctor,
  imagePath,
  label,
  confidence,
  doctorFeedback
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

      // Doctor Feedback section
      doc.fontSize(14).text("Doctor Feedback", 50, doc.y, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(doctorFeedback || "Not submitted yet", { align: "left" });

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

module.exports = { generatePdf };
