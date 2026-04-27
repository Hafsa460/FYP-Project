// utils/notificationService.js
// Placeholder for notification service
// TODO: Implement actual notification sending (email, SMS, etc.)

const notifyPatientReport = async (patient, doctor, reportData) => {
  // TODO: Send notification to patient about new report
  console.log(`Notification: New report ${reportData.caseId} for patient ${patient.name}`);
};

const notifyDoctorReport = async (doctor, patient, reportData) => {
  // TODO: Send notification to doctor about report verification
  console.log(`Notification: Report ${reportData.caseId} verified for doctor ${doctor.name}`);
};

module.exports = { notifyPatientReport, notifyDoctorReport };