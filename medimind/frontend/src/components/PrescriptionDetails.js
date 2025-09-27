import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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
          <strong>Investigation:</strong> {prescription.investigation || "N/A"}
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

        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </>
  );
}

export default PrescriptionDetails;
