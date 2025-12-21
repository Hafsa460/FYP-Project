const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateAppointmentPDF = async (appointment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // ✅ Ensure folder exists
      const folderPath = path.join(__dirname, "..", "uploads", "Appointment");
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const fileName = `Appointment_${appointment._id}.pdf`;
      const filePath = path.join(folderPath, fileName);
      const publicPath = `/uploads/Appointment/${fileName}`;

      doc.pipe(fs.createWriteStream(filePath));

      // LOGO
      const logoPath = path.join(__dirname, "..", "uploads", "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 });
      }

      // HEADER
      doc.fontSize(22).text("KRL HOSPITAL ISLAMABAD", 120, 50);
      doc.fontSize(12).text("Diagnostic Imaging Center", 120, 78);
      doc.text("Tel: 051-1234567", 120, 94);

      doc.moveDown(8);

      const LEFT_X = 50; // 🔴 FORCE LEFT ALIGNMENT

      // PATIENT INFO
      doc.fontSize(16).text("Patient Information", LEFT_X, doc.y, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12)
        .text(`Name      : ${appointment.patientId.name}`, LEFT_X)
        .text(`MR No     : ${appointment.patientId.mrNo || "N/A"}`, LEFT_X)
        .text(`Gender    : ${appointment.patientId.gender || "N/A"}`, LEFT_X)
        .text(`Age       : ${appointment.patientId.age || "N/A"}`, LEFT_X);

      doc.moveDown();

      // APPOINTMENT INFO
      doc.fontSize(16).text("Appointment Details", LEFT_X, doc.y, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12)
        .text(
          `Doctor    : ${appointment.doctorId.name} (${appointment.doctorId.department})`,
          LEFT_X
        )
        .text(`Date      : ${appointment.date.toDateString()}`, LEFT_X)
        .text(`Time      : ${appointment.time}`, LEFT_X)
        .text(`Fee       : PKR 2000`, LEFT_X);

      doc.moveDown(3);

      // FOOTER
      doc.fontSize(10).text(
        "Please present this PDF at the hospital counter.",
        LEFT_X,
        doc.y,
        { align: "center", width: 500 }
      );

      doc.end();

      resolve(publicPath);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateAppointmentPDF;
