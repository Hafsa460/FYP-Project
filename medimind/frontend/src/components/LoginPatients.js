import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import coverimage from "../images/cover.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [mrNo, setMrNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    console.log("[LoginPatients] Logging in with MR No:", mrNo, "Password:", password);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { 
        mrNo: Number(mrNo), // ✅ Convert to number before sending
        password 
      });
      console.log("[LoginPatients] Login success:", res.data);
      navigate("/PatientDashboard");
    } catch (err) {
      console.error("[LoginPatients] Login failed:", err.response);
      setError(err.response?.data?.message || "Login failed");
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
          <h2 className="text-teal mb-4 text-center">Login</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            {/* MR No */}
            <div className="mb-3">
              <label className="form-label">MR No</label>
              <input
                type="text"
                className="form-control"
                value={mrNo}
                onChange={(e) => setMrNo(e.target.value)}
                placeholder="Enter MR No"
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
              Don't have an account?{" "}
              <a
                href="/signup"
                style={{ color: "#059da8", textDecoration: "underline" }}
              >
                Sign up
              </a>
            </p>

            {/* Added Forgot Password link */}
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
