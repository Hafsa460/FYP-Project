import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import coverimage from "../images/cover.png";

function SignUp() {
  const [cnic, setCnic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValidCnic = (cnic) => /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(cnic);

  const handleSignUp = (e) => {
    e.preventDefault(); // Prevent form reload
    if (!cnic || !email || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!isValidCnic(cnic)) {
      alert("Invalid CNIC format. Please use 12345-1234567-1");
      return;
    }

    // Placeholder: You can now send data to backend or Firebase
    alert("Account created successfully!");
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#76ced4" }}
    >
      <div
        className="row login-container shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "900px", width: "100%" }}
      >
        {/* Left Side - Form */}
        <div className="col-md-6 bg-white p-5">
          <h2 className="text-center fw-bold" style={{ color: "#008080" }}>
            HOSPITAL
          </h2>
          <p className="text-center text-muted">Create Your Account</p>

          <form onSubmit={handleSignUp}>
            <div className="mb-3">
              <label htmlFor="cnic" className="form-label">
                CNIC (Pakistan)
              </label>
              <input
                type="text"
                className="form-control"
                id="cnic"
                placeholder="12345-1234567-1"
                value={cnic}
                onChange={(e) => {
                  const value = e.target.value;
                  const pattern = /^[0-9]{0,5}-?[0-9]{0,7}-?[0-9]{0,1}$/;
                  if (pattern.test(value)) {
                    setCnic(value);
                  }
                }}
                maxLength={15}
              />
              <small className="text-muted">Format: 12345-1234567-1</small>
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn w-100"
              style={{ backgroundColor: "#00b3b3", color: "white" }}
            >
              Create Account
            </button>

            <p className="text-center mt-3">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>

        {/* Right Side - Image */}
        <div
          className="col-md-6 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "#e6f9ff" }}
        >
          <img src={coverimage} alt="KRL Hospital" style={{ width: "70%" }} />
        </div>
      </div>
    </div>
  );
}

export default SignUp;
