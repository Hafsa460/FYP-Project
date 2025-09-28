import React, { useState } from "react";
import "./ViewPrescription.css"; 

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ViewPrescription() {
  const [mrNo, setMrNo] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // 🔹 new state for errors

  // 🔹 Fetch prescriptions by MR No
  const fetchPrescriptions = async () => {
    if (!mrNo) {
      setErrorMessage("Enter MR No");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/prescriptions/search/${mrNo}`);
      const data = await res.json();

      if (res.ok) {
        setPrescriptions(data);
        setSelectedPrescription(null);
        setErrorMessage(""); // clear errors on success
      } else {
        setErrorMessage(data.message || "Error fetching prescriptions");
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setErrorMessage("Failed to fetch prescriptions");
    }
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleGoBack = () => {
    setSelectedPrescription(null);
  };

  return (
    <div className="vp-container">
      <h4 className="vp-title">View Prescriptions</h4>

      {/* Search bar */}
      {!selectedPrescription && (
        <div className="vp-search-bar">
          <input
            type="text"
            placeholder="Enter Patient MR No"
            value={mrNo}
            onChange={(e) => setMrNo(e.target.value)}
            className="vp-input"
          />
          <button onClick={fetchPrescriptions} className="vp-btn-search">
            Search
          </button>
        </div>
      )}

      {/* 🔹 Show error message below search bar */}
      {errorMessage && (
        <p style={{ color: "red", marginTop: "8px" }}>{errorMessage}</p>
      )}

      {/* 🔹 If a prescription is selected → Show details only */}
      {selectedPrescription ? (
        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Prescription Details</h5>

            <div className="vp-row-between">
              <strong>PR No: {selectedPrescription.prNo}</strong>
              <span>
                Date: {new Date(selectedPrescription.date).toLocaleDateString()}
              </span>
            </div>

            <div className="vp-detail">
              <strong>Doctor:</strong> {selectedPrescription.doctor?.name}
            </div>
            <div className="vp-detail">
              <strong>Patient:</strong> {selectedPrescription.patient?.name} (MR
              No: {selectedPrescription.patient?.mrNo})
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

            <button onClick={handleGoBack} className="vp-btn-back">
              ← Go Back
            </button>
          </div>
        </div>
      ) : (
        <>
          {prescriptions.length > 0 ? (
            <div className="vp-card">
              <div className="vp-card-body p-0">
                <table className="vp-table">
                  <thead>
                    <tr>
                      <th>PR No</th>
                      <th>Doctor</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p) => (
                      <tr key={p._id}>
                        <td>{p.prNo}</td>
                        <td>{p.doctor?.name}</td>
                        <td>{p.patient?.name}</td>
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
                  </tbody>
                </table>
              </div>
            </div>
          ) :(<p></p>)}
        </>
      )}
    </div>
  );
}

export default ViewPrescription;
