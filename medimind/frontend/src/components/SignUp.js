import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import coverimage from "../images/cover.png";
import Navbar from "./Navbar.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUpPatients() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  // Validation functions
    const validateName = (name) => /^[A-Za-z ]{3,}$/.test(name);

  const validateEmail = (email) => /^[^\s@]+@gmail\.com$/.test(email);

  // Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      pwd
    );

  const validateDob = (dob) => {
    if (!dob) return false;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18 && birthDate <= today;
  };

  const validateGender = (gender) => gender === "Male" || gender === "Female";

  const handleSignUp = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!validateName(name)) {
      newErrors.name = "At least 3 letters, only alphabets & spaces allowed.";
    }
    if (!validateEmail(email)) {
      newErrors.email = "Enter a valid Gmail address (@gmail.com).";
    }
    if (!validateDob(dob)) {
      newErrors.dob = "You must be at least 18 years old.";
    }
    if (!validateGender(gender)) {
      newErrors.gender = "Please select your gender.";
    }
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
      const response = await fetch(
        "http://localhost:5000/api/users/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
  email,
  name,
  dob,      // ✅ send date of birth
  gender,
  password,
}),

        }
      );

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

  const inputClass = (field) =>
    errors[field] ? "form-control is-invalid" : "form-control";

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

            <form onSubmit={handleSignUp} noValidate>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className={inputClass("name")}
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <div className="invalid-feedback d-block">{errors.name}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email (Gmail only)
                </label>
                <input
                  type="email"
                  className={inputClass("email")}
                  id="email"
                  placeholder="Enter your Gmail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <div className="invalid-feedback d-block">{errors.email}</div>
                )}
              </div>

              {/* DOB */}
              <div className="mb-3">
                <label htmlFor="dob" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className={inputClass("dob")}
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.dob && (
                  <div className="invalid-feedback d-block">{errors.dob}</div>
                )}
              </div>

              {/* Gender */}
              <div className="mb-3">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  id="gender"
                  className={inputClass("gender")}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && (
                  <div className="invalid-feedback d-block">
                    {errors.gender}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="d-flex">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass("password")} flex-grow-1`}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="d-flex">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${inputClass("confirmPassword")} flex-grow-1`}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary ms-2"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
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

              {/* Submit */}
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
