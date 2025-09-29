import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "./Navbar";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // 🔹 Password validation: min 8 chars, 1 upper, 1 lower, 1 number, 1 special
  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      pwd
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const newErrors = {};
    if (!validatePassword(password)) {
      newErrors.password =
        "Min 8 chars, include uppercase, lowercase, number & special char.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      console.log("[ResetPassword] Sending new password for token:", token);
      const res = await axios.post(
        `http://localhost:5000/api/password/reset-password/${token}`,
        { password }
      );
      console.log("[ResetPassword] Response:", res.data);
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login-patient");
      }, 2000);
    } catch (err) {
      console.error("[ResetPassword] Error:", err.response || err);
      setErrors({
        general: err.response?.data?.message || "Failed to reset password",
      });
    }
  };

  const inputClass = (field) =>
    errors[field] ? "form-control is-invalid" : "form-control";

  return (
    <>
      {" "}
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: 400 }}>
        <h2>Reset Password</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {errors.general && (
          <div className="alert alert-danger">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-3">
            <label>New Password</label>
            <div className="d-flex">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputClass("password")} flex-grow-1`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label>Confirm New Password</label>
            <div className="d-flex">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`${inputClass("confirmPassword")} flex-grow-1`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary ms-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="invalid-feedback d-block">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 btn-teal">
            Change Password
          </button>
        </form>
      </div>
    </>
  );
}
