import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ViewPrescription() {
  const [mrNo, setMrNo] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);

  const fetchPrescriptions = async () => {
    if (!mrNo) return alert("Enter MR No");
    try {
      const res = await fetch(`${API_URL}/api/prescriptions/search/${mrNo}`);
      const data = await res.json();

      if (res.ok) {
        setPrescriptions(data);
      } else {
        alert(data.message || "Error fetching prescriptions");
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      alert("Failed to fetch prescriptions");
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">View Prescriptions</h4>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Enter Patient MR No"
          value={mrNo}
          onChange={(e) => setMrNo(e.target.value)}
          className="form-control"
        />
        <button onClick={fetchPrescriptions} className="btn btn-primary">
          Search
        </button>
      </div>

      {prescriptions.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>PR No</th>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Diagnosis</th>
              <th>Prescription</th>
              <th>Follow Up</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p._id}>
                <td>{p.prNo}</td>
                <td>{p.doctor?.name}</td>
                <td>
                  {p.patient?.name} (MR No: {p.patient?.mrNo})
                </td>
                <td>{p.diagnosis}</td>
                <td>{p.prescription}</td>
                <td>{p.followUp}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No prescriptions found</p>
      )}
    </div>
  );
}

export default ViewPrescription;
