import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  ClipboardList,
  Download,
  AlertCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PatientRecords() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    }
  }, []);

  useEffect(() => {
    if (!patient?._id) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Appointments
        const appointmentsRes = await fetch(
          `${API_URL}/api/appointments/patient/${patient._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const appointmentsData = await appointmentsRes.json();
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData?.data && Array.isArray(appointmentsData.data) ? appointmentsData.data : []));

        // Fetch Prescriptions
        const prescriptionsRes = await fetch(`${API_URL}/api/patient-prescriptions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : (prescriptionsData?.data && Array.isArray(prescriptionsData.data) ? prescriptionsData.data : []));

        // Fetch Reports
        const reportsRes = await fetch(`${API_URL}/api/reports/patient/${patient.mrNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reportsData = await reportsRes.json();
        setReports(
          Array.isArray(reportsData)
            ? reportsData
            : Array.isArray(reportsData.reports)
            ? reportsData.reports
            : Array.isArray(reportsData.data)
            ? reportsData.data
            : []
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [patient, token]);

  const handleDownloadPrescriptionPDF = (prescription) => {
    if (!prescription) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(16);
    doc.text("Prescription Details", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);

    // PR No and Date
    doc.text(`PR No: ${prescription.prNo}`, 14, 30);
    doc.text(
      `Date: ${new Date(prescription.date).toLocaleDateString()}`,
      pageWidth - 14,
      30,
      { align: "right" }
    );

    // Doctor and MR No
    doc.text(`Doctor: ${prescription.doctor?.name || "N/A"}`, 14, 40);
    doc.text(
      `MR No: ${prescription.patient?.mrNo || ""}`,
      pageWidth - 14,
      40,
      { align: "right" }
    );

    // Patient details
    doc.text(
      `Patient Name: ${prescription.patient?.name || ""}`,
      14,
      50
    );
    doc.text(`Age: ${prescription.patient?.age || ""}`, pageWidth - 14, 50, {
      align: "right",
    });

    doc.text(`Gender: ${prescription.patient?.gender || ""}`, 14, 60);

    // Details
    const details = [
      `Diagnosis: ${prescription.diagnosis || "N/A"}`,
      `Prescription: ${prescription.prescription || "N/A"}`,
      `Follow Up: ${prescription.followUp || "N/A"}`,
      `Test Recommendation: ${prescription.testRecommendation || "N/A"}`,
      `Clinical Summary: ${prescription.clinicalSummary || "N/A"}`,
      `Investigation: ${prescription.investigation || "N/A"}`,
    ];

    let startY = 75;
    doc.setFontSize(12);
    details.forEach((line) => {
      doc.text(line, pageWidth / 2, startY, { align: "center" });
      startY += 10;
    });

    doc.save(`Prescription_${prescription.prNo}.pdf`);
  };

  if (!patient) {
    return <div className="p-4">Loading patient data...</div>;
  }

  return (
    <div className="patient-records-container">
      <h3 className="mb-4">Patient Records & Data</h3>

      {error && (
        <div className="alert alert-warning d-flex align-items-center mb-3">
          <AlertCircle className="me-2" size={20} />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded shadow-sm p-2 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn ${
              activeTab === "appointments" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setActiveTab("appointments");
              setSelectedPrescription(null);
            }}
          >
            <Calendar size={18} className="me-2" style={{ display: "inline" }} />
            Appointments
          </button>

          <button
            className={`btn ${
              activeTab === "prescriptions" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setActiveTab("prescriptions");
              setSelectedPrescription(null);
            }}
          >
            <FileText size={18} className="me-2" style={{ display: "inline" }} />
            Prescriptions
          </button>

          <button
            className={`btn ${
              activeTab === "reports" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setActiveTab("reports");
              setSelectedPrescription(null);
            }}
          >
            <ClipboardList size={18} className="me-2" style={{ display: "inline" }} />
            My Reports
          </button>
        </div>
      </div>

      {/* APPOINTMENTS TAB */}
      {activeTab === "appointments" && (
        <div>
          {loading ? (
            <div className="text-muted">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="alert alert-info">No appointments found.</div>
          ) : (
            <div className="row g-3">
              {appointments.map((appt) => (
                <div key={appt._id} className="col-md-6">
                  <div className="card shadow-sm p-3 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-semibold mb-0">{appt.doctorId?.name}</h6>
                      <span
                        className={`badge ${
                          appt.status === "Completed"
                            ? "bg-success"
                            : appt.status === "Pending"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <p className="mb-1 text-muted small">
                      <Calendar size={14} className="me-1" />
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>

                    <p className="mb-2 text-muted small">
                      Department: {appt.doctorId?.department}
                    </p>

                    {appt.pdf && (
                      <a
                        href={`${API_URL}${appt.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <Download size={14} className="me-1" />
                        Open PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeTab === "prescriptions" && (
        <div>
          {loading ? (
            <div className="text-muted">Loading prescriptions...</div>
          ) : selectedPrescription ? (
            <div className="card shadow-sm">
              <div className="card-body">
                <button
                  className="btn btn-outline-secondary btn-sm mb-3"
                  onClick={() => setSelectedPrescription(null)}
                >
                  ← Back to List
                </button>

                <h5 className="card-title mb-3">Prescription Details</h5>

                <div className="row mb-2">
                  <div className="col-md-6">
                    <strong>PR No:</strong> {selectedPrescription.prNo}
                  </div>
                  <div className="col-md-6 text-end">
                    <strong>Date:</strong> {new Date(selectedPrescription.date).toLocaleDateString()}
                  </div>
                </div>

                <hr />

                <div className="mb-2">
                  <strong>Doctor:</strong> {selectedPrescription.doctor?.name}
                </div>
                <div className="mb-2">
                  <strong>Diagnosis:</strong> {selectedPrescription.diagnosis || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Prescription:</strong> {selectedPrescription.prescription || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Follow Up:</strong> {selectedPrescription.followUp || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Test Recommendation:</strong>{" "}
                  {selectedPrescription.testRecommendation || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Clinical Summary:</strong>{" "}
                  {selectedPrescription.clinicalSummary || "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Investigation:</strong> {selectedPrescription.investigation || "N/A"}
                </div>

                <button
                  onClick={() => handleDownloadPrescriptionPDF(selectedPrescription)}
                  className="btn btn-primary"
                >
                  <Download size={16} className="me-2" style={{ display: "inline" }} />
                  Download PDF
                </button>
              </div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="alert alert-info">No prescriptions found.</div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr className="table-light">
                      <th>PR No</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription._id}>
                        <td>{prescription.prNo}</td>
                        <td>{prescription.doctor?.name}</td>
                        <td>{new Date(prescription.date).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => setSelectedPrescription(prescription)}
                            className="btn btn-outline-primary btn-sm me-2"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDownloadPrescriptionPDF(prescription)}
                            className="btn btn-outline-secondary btn-sm"
                          >
                            <Download size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <div>
          {loading ? (
            <div className="text-muted">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="alert alert-info">No reports found.</div>
          ) : (
            <div className="row g-3">
              {reports.map((report) => (
                <div key={report._id} className="col-md-6">
                  <div className="card shadow-sm p-3 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-semibold mb-0">
                        <ClipboardList size={16} className="me-2" style={{ display: "inline" }} />
                        {report.testName || "Test Report"}
                      </h6>
                      <span
                        className={`badge ${
                          report.status === "Completed"
                            ? "bg-success"
                            : report.status === "Pending"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {report.status || "Pending"}
                      </span>
                    </div>

                    <p className="mb-1 text-muted small">
                      <Calendar size={14} className="me-1" />
                      {new Date(report.date || report.createdAt).toLocaleDateString()}
                    </p>

                    <p className="mb-2 text-muted small">
                      Result: <em>{report.result || report.findings || "Awaiting review"}</em>
                    </p>

                    {report.pdf && (
                      <a
                        href={`${API_URL}${report.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <Download size={14} className="me-1" />
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientRecords;
