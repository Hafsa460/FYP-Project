import React, { useState } from "react";
import './VerifyReports.css'; // Make sure this CSS file exists

function VerifyReports() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile); // ⚡ Key must match Flask

      const res = await fetch("http://127.0.0.1:5000/predict-stroke", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to get prediction from server");

      const data = await res.json();

      if (data.success) {
        setResult({
          prediction: data.prediction,
          confidence: data.confidence.toFixed(2),
        });
      } else {
        setError(data.message || "Prediction failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-reports-container">
      <h3>Verify Test Reports</h3>

      <form className="verify-reports-form" onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {selectedFile && (
        <div className="image-preview">
          <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="result-box">
          <h4>Prediction Result:</h4>
          <p><strong>Prediction:</strong> {result.prediction}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
        </div>
      )}
    </div>
  );
}

export default VerifyReports;
