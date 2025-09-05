// src/components/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import coverimage from "../images/cover.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/admins/login", {
        id: Number(id.trim()),
        password: password.trim(),
      });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminRole", res.data.role);
      localStorage.setItem("adminName", res.data.name);

      if (res.data.role === "doctorAdmin") navigate("/dctr");
      else if (res.data.role === "patientAdmin")
        navigate("/PatientAdmin/AdminPage");
      else if (res.data.role === "departmentAdmin") navigate("/department");
      else if (res.data.role === "superAdmin") navigate("/super");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-container shadow-lg row w-100">
        {/* Left Image Section */}
        <div className="col-md-6 image-section">
          <img src={coverimage} alt="Admin Login" className="img-fluid" />
        </div>

        {/* Right Form Section */}
        <div className="col-md-6 form-section p-5">
          <h2 className="text-teal mb-4 text-center">Admin Login</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            {/* Admin ID */}
            <div className="mb-3">
              <label className="form-label">Admin ID</label>
              <input
                type="number"
                className="form-control"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter Admin ID"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-teal w-100 mt-3">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
