import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import jsPDF from "jspdf";
import "jspdf-autotable";

function PrescriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/prescriptions/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data._id) {
          setPrescription(data);
        } else {
          setError("Prescription not found");
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching prescription:", err);
        setError("Failed to load prescription");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = (prescription) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Prescription Details", 14, 20);
  doc.setFontSize(12);

  const lines = [
    ["Date", new Date(prescription.date).toLocaleDateString()],
    ["Doctor", prescription.doctor?.name || "N/A"],
    ["Diagnosis", prescription.diagnosis || "N/A"],
    ["Clinical Summary", prescription.clinicalSummary || "N/A"],
    ["Investigation", prescription.investigation || "N/A"],
    ["Prescription", prescription.prescription || "N/A"],
    ["Test Recommendation", prescription.testRecommendation || "N/A"],
    ["Follow Up", prescription.followUp || "N/A"],
  ];

  doc.autoTable({
    startY: 30,
    head: [["Field", "Details"]],
    body: lines,
    theme: "grid",
    headStyles: { fillColor: [52, 58, 64], textColor: 255 },
  });

  doc.save(`Prescription_${prescription.prNo}.pdf`);
};
  if (loading) return <p className="p-4">Loading prescription...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h3>Prescription Details</h3>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(prescription.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Doctor:</strong> {prescription.doctor?.name}
        </p>
        <p>
          <strong>Diagnosis:</strong> {prescription.diagnosis || "N/A"}
        </p>
        <p>
          <strong>Clinical Summary:</strong>{" "}
          {prescription.clinicalSummary || "N/A"}
        </p>
        <p>
          <strong>Inveggggggggstigation:</strong> {prescription.investigation || "N/A"}
        </p>
        <p>
          <strong>Prescription:</strong> {prescription.prescription || "N/A"}
        </p>
        <p>
          <strong>Test Recommendation:</strong>{" "}
          {prescription.testRecommendation || "N/A"}
        </p>
        <p>
          <strong>Follow Up:</strong> {prescription.followUp || "N/A"}
        </p>

        {/* Buttons container */}
        <div className="mt-3 d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default PrescriptionDetails;
