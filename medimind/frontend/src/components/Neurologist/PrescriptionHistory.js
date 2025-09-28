import React, { useState } from "react";

function PrescriptionHistory() {
  const [mrNo, setMrNo] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPrescriptions = async () => {
    if (!mrNo) return;
    setLoading(true);
    try {
      // ✅ fixed backticks here
      const res = await fetch(`/api/prescriptions/search/${mrNo}`);
      const data = await res.json();
      if (res.ok) setPrescriptions(data);
      else setPrescriptions([]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="login-page flex justify-center items-center">
      <div className="login-container p-6 shadow-lg">
        <h3 className="text-teal mb-4">Prescription History</h3>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Patient MR No"
            value={mrNo}
            onChange={(e) => setMrNo(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            className="btn-teal px-4 py-2 rounded"
            onClick={fetchPrescriptions}
          >
            Search
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {/* Prescription Table */}
        {prescriptions.length > 0 ? (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">PR ID</th>
                <th className="p-2 border">Doctor</th>
                <th className="p-2 border">Diagnosis</th>
                <th className="p-2 border">Prescription</th>
                <th className="p-2 border">Follow Up</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id}>
                  <td className="border p-2">{p.prId}</td>
                  <td className="border p-2">{p.doctor?.name}</td>
                  <td className="border p-2">{p.diagnosis}</td>
                  <td className="border p-2">{p.prescription}</td>
                  <td className="border p-2">{p.followUp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p>No prescriptions found</p>
        )}

        <div className="flex gap-3 mt-4">
          <button className="btn-teal px-4 py-2 rounded">New Prescription</button>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionHistory;
