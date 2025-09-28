import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AddPrescription() {
  const [mrNo, setMrNo] = useState("");
  const [patient, setPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    testRecommendation: "",
    clinicalSummary: "",
    investigation: "",
    prescription: "",
    diagnosis: "",
    followUp: "",
  });

  const doctor = JSON.parse(localStorage.getItem("doctor")); // logged-in doctor

  // 🔍 Search patient
  const searchPatient = async () => {
    try {
      const res = await fetch(`${API_URL}/api/prescriptions/patient/${mrNo}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Patient not found");
        setPatient(null);
        return;
      }
      setPatient(data);
    } catch (err) {
      console.error("❌ Search error:", err);
      alert("Failed to search patient");
    }
  };

  // 📥 Input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 📤 Submit prescription
  const submitPrescription = async (e) => {
    e.preventDefault();

    if (!doctor || !doctor._id) {
      alert("❌ No doctor logged in. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/prescriptions/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor._id,
          mrNo: patient.mrNo,
          ...form,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          `✅ Prescription Added!\nPR No: ${data.prNo}\nDate: ${new Date(
            data.date
          ).toLocaleDateString()}`
        );
        // Reset form + UI
        setForm({
          testRecommendation: "",
          clinicalSummary: "",
          investigation: "",
          prescription: "",
          diagnosis: "",
          followUp: "",
        });
        setShowForm(false);
        setMrNo("");
        setPatient(null);
      } else {
        alert(data.message || "Error adding prescription");
      }
    } catch (err) {
      console.error("❌ Add prescription error:", err);
      alert("Failed to add prescription");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Search Section */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center text-teal-600">
          Search Patient
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Patient MR No"
            value={mrNo}
            onChange={(e) => setMrNo(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={searchPatient}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Patient Info */}
      {patient && !showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">{patient.name}</h3>
          <p>MR No: {patient.mrNo}</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Prescription
          </button>
        </div>
      )}

      {/* Prescription Form */}
      {showForm && (
        <form
          onSubmit={submitPrescription}
          className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-teal-600">
            Add Prescription
          </h2>

          {Object.keys(form).map((field) => (
            <div key={field} className="mb-4">
              <label className="block mb-1 font-medium capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700"
          >
            Submit Prescription
          </button>
        </form>
      )}
    </div>
  );
}

export default AddPrescription;
