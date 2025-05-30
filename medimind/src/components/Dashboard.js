import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"; // Reuse your CSS
import coverimage from "../images/cover.png";
import LoginPatients from "./LoginPatients";
import Login from "./Login";
import SignUp from "./SignUp";

function LoginDashboard() {
  const [view, setView] = useState("dashboard");

  const renderContent = () => {
    switch (view) {
      case "patient":
        return <LoginPatients />;
      case "doctor":
        return <Login />;
      case "signup":
        return <SignUp />;
      default:
        return (
          <div
            className="container-fluid d-flex justify-content-center align-items-center min-vh-100"
            style={{ backgroundColor: "#00b3b3" }}
          >
            <div
              className="row login-container shadow-lg rounded-4 overflow-hidden"
              style={{ maxWidth: "900px", width: "100%" }}
            >
              {/* Left Side - Options */}
              <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center align-items-center">
                <h2 className="fw-bold mb-4" style={{ color: "#008080" }}>
                  Welcome
                </h2>
                <p className="text-muted mb-4">Choose your portal</p>
                <button
                  className="btn w-100 mb-3"
                  style={{ backgroundColor: "#00b3b3", color: "white" }}
                  onClick={() => setView("patient")}
                >
                  Login as Patient
                </button>
                <button
                  className="btn w-100 mb-3"
                  style={{ backgroundColor: "#00b3b3", color: "white" }}
                  onClick={() => setView("doctor")}
                >
                  Login as Doctor
                </button>
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: "#e6f9ff",
                    border: "1px solid #00b3b3",
                    color: "#008080",
                  }}
                  onClick={() => setView("signup")}
                >
                  Sign Up
                </button>
              </div>

              {/* Right Side - Image */}
              <div
                className="col-md-6 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#e6f9ff" }}
              >
                <img
                  src={coverimage}
                  alt="Hospital Cover"
                  style={{ width: "70%" }}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
}

export default LoginDashboard;
