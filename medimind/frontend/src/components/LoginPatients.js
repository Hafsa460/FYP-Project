import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import coverimage from "../images/cover.png";
<<<<<<< HEAD:medimind/src/components/LoginPatients.js
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import { useNavigate } from "react-router-dom";
=======
import SignUp from "./SignUp.js";
import ForgotPassword from "./ForgotPassword.js";
>>>>>>> hafsa13:medimind/frontend/src/components/LoginPatients.js
import Navbar from "./Navbar.js";
function LoginPatients() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const validateLogin = (e) => {
    e.preventDefault();
    if (username === "hafsa13" && password === "hafsa") {
      navigate("/PatientDashboard");
    } else {
      alert("Incorrect username or password!");
    }
  };

  if (showSignUp) return <SignUp />;
  if (showForgotPassword) return <ForgotPassword />;

  return (
    <>
      <Navbar />
      <div className="container-fluid back d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="row login-container shadow-lg rounded-4 overflow-hidden"
          style={{ maxWidth: "900px", width: "100%" }}
        >
          <div className="col-md-6 bg-white p-5">
            <h2 className="text-center fw-bold" style={{ color: "#008080" }}>
              HOSPITAL
            </h2>
            <p className="text-center text-muted">Patient Login</p>

            <form onSubmit={validateLogin}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Enter your username"
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

              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#00b3b3", color: "white" }}
              >
                Login
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <p className="text-center mt-4">
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setShowSignUp(true)}
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>
          <div
            className="col-md-6 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#e6f9ff" }}
          >
            {<img src={coverimage} alt="Hospital" style={{ width: "70%" }} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPatients;
