import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import coverimage from "../images/cover.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function DoctorLogin() {
  const [pno, setPno] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/doctors/login", {
        pno: Number(pno),
        password,
      });

      localStorage.setItem("doctorToken", res.data.token);
      localStorage.setItem("doctor", JSON.stringify(res.data.doctor));

      // ✅ FIXED: do NOT use /* here
      navigate("/neuro-dashboard");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-container shadow-lg row w-100">
        {/* Left Image Section */}
        <div className="col-md-6 image-section">
          <img src={coverimage} alt="Login" className="img-fluid" />
        </div>

        {/* Right Form Section */}
        <div className="col-md-6 form-section p-5">
          <h2 className="text-teal mb-4 text-center">Doctor Login</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            {/* PNo */}
            <div className="mb-3">
              <label className="form-label">PNo (7-digit)</label>
              <input
                type="number"
                className="form-control"
                value={pno}
                onChange={(e) => setPno(e.target.value)}
                placeholder="Enter PNo"
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

            <p>
              <a
                href="/forgot-password"
                style={{ color: "#059da8", textDecoration: "underline" }}
              >
                Forgot Password?
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
