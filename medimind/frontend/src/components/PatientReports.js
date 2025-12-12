import React, { useEffect, useState } from "react";

function PatientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const patientData = JSON.parse(localStorage.getItem("patient") || "{}");
    if (!patientData || !patientData.mrNo) return;

    const mrNo = patientData.mrNo;

    fetch(`http://localhost:5000/api/reports/patient/${mrNo}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReports(data.reports);
        }
      })
      .catch((err) => console.error("Error fetching reports:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="p-4">
      <h2>My Reports</h2>
      {reports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Date</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td>{r.caseId}</td>
                <td>{r.prediction.label}</td>
                <td>{(r.prediction.confidence * 100).toFixed(2)}%</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <a
                    href={`http://localhost:5000/uploads/${r.pdfPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                    download
                  >
                    Download PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientReports;
