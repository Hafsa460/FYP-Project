<<<<<<< HEAD
import React from "react";

const ForgotPassword = () => {
  return <div>ForgotPassword</div>;
};

export default ForgotPassword;
=======
import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");
  console.log("[ForgotPassword] Sending reset email request for:", email);

  try {
    const res = await axios.post("http://localhost:5000/api/password/forgot-password", { email });
    console.log("[ForgotPassword] Response:", res.data);
    setMessage(res.data.message);
  } catch (err) {
    console.error("[ForgotPassword] Error response:", err.response);
    setError(err.response?.data?.message || "Error sending reset email");
  }
};


  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2>Forgot Password</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your registered Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 btn-teal">Send Reset Link</button>
      </form>
    </div>
  );
}
>>>>>>> sirat
