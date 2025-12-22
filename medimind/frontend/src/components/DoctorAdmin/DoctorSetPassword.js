import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Login.css";

export default function DoctorSetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      pwd
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      return setError(
        "Password must be 8+ chars with uppercase, lowercase, number & special char"
      );
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    const res = await fetch(
      `http://localhost:5000/api/doctor-admin/set-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );

    const data = await res.json();

    if (data.success) {
      navigate("/doctor-verify-success");
    } else {
      setError(data.error || "Failed to set password");
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-container row shadow-lg">
        <div className="col-md-6 image-section">
          <h2 className="text-teal">Set Password</h2>
        </div>

        <div className="col-md-6 form-section p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3 password-wrapper">
              <input
                type={showPwd ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="mb-3 password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <p className="text-danger">{error}</p>}

            <button type="submit" className="btn btn-teal w-100">
              Set Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
