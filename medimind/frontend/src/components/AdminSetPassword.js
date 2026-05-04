import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminSetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const showDialog = (type, message) =>
    setDialog({ show: true, type, message });

  const closeDialog = () => setDialog({ show: false, type: "", message: "" });

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
        showDialog("success", data.message || "Password set successfully.");
      } else {
        showDialog("error", data.error || "Invalid or expired link");
      }
    } catch (err) {
      setLoading(false);
      showDialog("error", "Server error");
    }
  };

  return (
    <div className="set-password-page">
      <h1>Set Your Password</h1>

      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Setting Password..." : "Set Password"}
        </button>
      </form>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <p>{dialog.message}</p>
            <button
              onClick={() => {
                closeDialog();
                if (dialog.type === "success") {
                  navigate("/adminLogin");
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
