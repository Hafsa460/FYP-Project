import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function AdminSetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const newErrors = {};
    if (!formData.password) newErrors.password = "Password required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password required";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/superadmin/set-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: formData.password }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage(data.message || "Password set successfully.");
        setTimeout(() => navigate("/adminLogin"), 2000);
      } else {
        setErrors({ general: data.error || "Invalid or expired link" });
      }
    } catch (err) {
      setLoading(false);
      setErrors({ general: "Server error" });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2>Admin Set Password</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {errors.general && <div className="alert alert-danger">{errors.general}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 password-wrapper">
          <label>New Password</label>
          <div className="d-flex">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`form-control ${errors.password ? "is-invalid" : ""} flex-grow-1`}
              value={formData.password}
              onChange={handleChange}
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

        <div className="mb-3 password-wrapper">
          <label>Confirm New Password</label>
          <div className="d-flex">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""} flex-grow-1`}
              value={formData.confirmPassword}
              onChange={handleChange}
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

        <button type="submit" className="btn btn-primary w-100 btn-teal" disabled={loading}>
          {loading ? "Setting Password..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
