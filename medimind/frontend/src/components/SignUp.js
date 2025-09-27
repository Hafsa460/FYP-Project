import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"; // ✅ Reuse the same CSS
import coverimage from "../images/cover.png";
import Navbar from "./Navbar.js";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 Added icons

function SignUpPatients() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 Toggle state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈 Toggle state

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: username,
          age: Number(age),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Verification email sent. Please check your Gmail.");
        window.location.href = "/signup";
      } else {
        alert(data.error || "Sign up failed");
      }
    } catch (error) {
      alert("Server error, please try again later.");
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid back d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="row login-container shadow-lg rounded-4 overflow-hidden"
          style={{ maxWidth: "900px", width: "100%" }}
        >
          {/* Left Side Form */}
          <div className="col-md-6 bg-white p-5">
            <h2 className="text-center fw-bold" style={{ color: "#008080" }}>
              HOSPITAL
            </h2>
            <p className="text-center text-muted">Patient Sign Up</p>

            <form onSubmit={handleSignUp}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Enter your full name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email (Gmail only)
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your Gmail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="age" className="form-label">
                  Age
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="age"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="1"
                  max="120"
                />
              </div>

{/* Password Field */}
<div className="mb-3">
  <label htmlFor="password" className="form-label">Password</label>
  <div className="password-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      className="form-control"
      id="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      minLength="6"
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

{/* Confirm Password Field */}
<div className="mb-3">
  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
  <div className="password-wrapper">
    <input
      type={showConfirmPassword ? "text" : "password"}
      className="form-control"
      id="confirmPassword"
      placeholder="Confirm your password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
      minLength="6"
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
    >
      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
</div>


              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#00b3b3", color: "white" }}
              >
                Sign Up
              </button>

              <p className="mt-3 text-center">
                Already have an account?{" "}
                <a
                  href="/login-patient"
                  style={{ color: "#059da8", textDecoration: "underline" }}
                >
                  Login
                </a>
              </p>
            </form>
          </div>

          {/* Right Side Image */}
          <div
            className="col-md-6 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#e6f9ff" }}
          >
            <img src={coverimage} alt="Hospital" style={{ width: "70%" }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPatients;

