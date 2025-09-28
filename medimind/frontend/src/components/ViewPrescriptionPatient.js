import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./Prescription.css";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ViewPrescriptionPatient() {
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/prescriptions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setPrescriptions(data);
        } else {
          setError(data.message || "Error fetching prescriptions");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to fetch prescriptions");
      }
    };

    fetchPrescriptions();
  }, []);

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleGoBack = () => {
    setSelectedPrescription(null);
  };

  return (
    <>
      <Navbar />
      <div className="vp-container p-4">
        <h4 className="vp-title mb-4">My Prescriptions</h4>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {selectedPrescription ? (
          <div className="card mt-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Prescription Details</h5>

              <div className="vp-row-between mb-2">
                <strong>PR No: {selectedPrescription.prNo}</strong>
                <span>
                  Date:{" "}
                  {new Date(selectedPrescription.date).toLocaleDateString()}
                </span>
              </div>

              <div className="vp-detail">
                <strong>Doctor:</strong> {selectedPrescription.doctor?.name}
              </div>

              <hr />

              <div className="vp-detail">
                <strong>Diagnosis:</strong>{" "}
                {selectedPrescription.diagnosis || "N/A"}
              </div>
              <div className="vp-detail">
                <strong>Prescription:</strong>{" "}
                {selectedPrescription.prescription || "N/A"}
              </div>
              <div className="vp-detail">
                <strong>Follow Up:</strong>{" "}
                {selectedPrescription.followUp || "N/A"}
              </div>
              <div className="vp-detail">
                <strong>Test Recommendation:</strong>{" "}
                {selectedPrescription.testRecommendation || "N/A"}
              </div>
              <div className="vp-detail">
                <strong>Clinical Summary:</strong>{" "}
                {selectedPrescription.clinicalSummary || "N/A"}
              </div>
              <div className="vp-detail">
                <strong>Investigation:</strong>{" "}
                {selectedPrescription.investigation || "N/A"}
              </div>

              <button onClick={handleGoBack} className="vp-btn-back mt-3">
                ← Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="vp-card">
            <div className="vp-card-body p-0">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>PR No</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((p) => (
                    <tr key={p._id}>
                      <td>{p.prNo}</td>
                      <td>{p.doctor?.name}</td>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="vp-btn-details"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan={4}>No prescriptions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ViewPrescriptionPatient;
