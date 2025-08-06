import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import coverimage from "../images/cover.png"; // Use circular image for right side
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successful");
        navigate("/neuro-dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in.");
    }
  };


  return (
    <>
      <Navbar />
      <div className="container-fluid login-page d-flex align-items-center justify-content-center">
        <div className="row w-100 login-container shadow-lg">
          <div className="col-md-6 form-section p-5">
            <h2 className="text-center fw-bold text-teal">HOSPITAL</h2>
            <p className="text-center mb-4">Doctors Login Portal</p>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Email
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter Email here"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-teal w-100" onClick={validateLogin}>
              Login
            </button>
          </div>

          {/* Right Section - Cover Image */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center image-section">
            <img
              src={coverimage}
              alt="Cover"
              className="img-fluid rounded-circle"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
