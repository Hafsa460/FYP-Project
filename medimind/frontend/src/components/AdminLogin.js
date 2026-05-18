// src/components/AdminLogin.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
        password: password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (!res.data || !res.data.token) {
        setError("Login failed: no token received");
        return;
      }

      // ✅ CLEAN STORAGE (ONLY ONE STANDARD)
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminRole", res.data.role);
      localStorage.setItem("adminName", res.data.name || "");

      console.log("ROLE SAVED:", localStorage.getItem("adminRole"));

      // ✅ ROLE REDIRECT
      switch (res.data.role) {
        case "doctorAdmin":
          navigate("/doctor-admin");
          break;

        case "patientAdmin":
          navigate("/patient-admin");
          break;

        case "departmentAdmin":
          navigate("/department-admin");
          break;

        case "superAdmin":
          navigate("/super");
          break;

        default:
          navigate("/adminLogin");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-container shadow-lg row w-100">
        {/* LEFT IMAGE */}
        <div className="col-md-6 image-section">
          <a href="/dash">
            <img
              src={coverimage}
              alt="Login"
              className="img-fluid"
              style={{ cursor: "pointer" }}
            />
          </a>
        </div>

        {/* RIGHT FORM */}
        <div className="col-md-6 form-section p-5">
          <h2 className="text-teal mb-4 text-center">Admin Login</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Admin ID</label>
              <input
                type="number"
                className="form-control"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-teal w-100">
              Login
            </button>

            <div className="text-center mt-3">
              <Link to="/admin-forgot-password">Forgot Password?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
