// src/components/Neurologist/VerifyReports.js
import React, { useState } from "react";
import "./VerifyReports.css";

function VerifyReports() {
  const [mrNoInput, setMrNoInput] = useState("");
  const [patient, setPatient] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [report, setReport] = useState(null);

  const storedDoc = (() => {
    try { return JSON.parse(localStorage.getItem("doctor")); } catch (e) { return null; }
  })();
  const doctorPno = storedDoc?.pno || "";

  async function searchPatient(e) {
    e.preventDefault();
    setError(null);
    setPatient(null);
    setReport(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);

    if (!mrNoInput) return setError("Enter MR No");

    try {
      const res = await fetch(`http://localhost:5000/api/users/search/${mrNoInput}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Patient not found");
      }
      const data = await res.json();
      setPatient(data);
    } catch (err) {
      setError(err.message || "Search failed");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setConfirmed(false);
    setReport(null);

    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  }

  function handleConfirmPreview() {
    if (!patient) return setError("Search and select patient first");
    if (!selectedFile) return setError("Select image first");
    setConfirmed(true);
    setError(null);
  }

  async function handleUploadAndGenerate(e) {
    e.preventDefault();
    setError(null);

    if (!confirmed) return setError("Please confirm the upload first");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("mrNo", patient.mrNo);
      formData.append("doctorPno", doctorPno);

      const res = await fetch("http://localhost:5000/api/reports/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setReport(data.report);
      setResult({
        prediction: data.report.prediction.label,
        confidence: (data.report.prediction.confidence * 100).toFixed(2),
      });

    } catch (err) {
      setError(err.message || "Error uploading");
    } finally {
      setLoading(false);
      setConfirmed(false);
    }
  }

  return (
    <div className="verify-reports-container">
      <h3>Verify Test Reports</h3>

      {/* STEP 1: MR SEARCH BOX ONLY */}
      {/* Hide search form once patient is found */}
{!patient && (
  <form className="search-form" onSubmit={searchPatient}>
    <input
      type="text"
      placeholder="Search MR No (e.g. 123456)"
      value={mrNoInput}
      onChange={(e) => setMrNoInput(e.target.value)}
    />
    <button type="submit">Search Patient</button>
  </form>
)}

      {error && <p className="error-message">{error}</p>}

      {/* STEP 2: SHOW PATIENT INFO + ENABLE IMAGE SECTION */}
      {patient && (
        <>
          <div className="patient-card">
  <div className="row">
    <p><strong>Name:</strong> {patient.name}</p>
    <p><strong>MR No:</strong> {patient.mrNo}</p>
  </div>
  <div className="row">
    <p><strong>Gender:</strong> {patient.gender}</p>
    <p><strong>Age:</strong> {patient.age}</p>
  </div>
</div>


          {/* Only show upload form if patient is found */}
          <form className="verify-reports-form" onSubmit={handleUploadAndGenerate}>
            <input type="file" accept="image/*" onChange={handleFileChange} />

            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={handleConfirmPreview} disabled={!selectedFile}>
                Preview & Confirm
              </button>

              <button type="submit" disabled={loading || !confirmed}>
                {loading ? "Processing..." : "Upload & Generate Report"}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Preview Section */}
      {previewUrl && (
        <div className="image-preview">
          <h4>Preview</h4>
          <img src={previewUrl} alt="Preview" />
          <p>{selectedFile?.name}</p>
          <p>{confirmed ? "✅ Confirmed — ready to upload" : "Click 'Preview & Confirm' to lock this image"}</p>
        </div>
      )}

      {/* RESULT + PDF */}
      {result && (
        <div className="result-box">
          <h4>Prediction Result:</h4>
          <p><strong>Prediction:</strong> {result.prediction}</p>
          {/* PDF Download Button */}
          {report?.pdfPath && (
            <a
              href={`http://localhost:5000/uploads/${report.pdfPath}`}
              target="_blank"
              download
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "10px 15px",
                backgroundColor: "#059da8",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Download PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyReports;
