import React, { useState } from "react";
import LoginPatients from "./LoginPatients.js";
import SignUp from "./SignUp.js";
import Login from "./Login.js";
import "./Dashboard.css";
import coverimage from "../images/cover.png";
function Dashboard() {
  const [view, setView] = useState("dashboard");

  const renderView = () => {
    switch (view) {
      case "patient":
        return <LoginPatients />;
      case "doctor":
        return <Login />;
      case "signup":
        return <SignUp />;
      default:
        return (
          <div className="dashboard-container">
            <div className="navbar-custom">
              <img
                src={coverimage}
                alt="KRL Hospital"
                style={{ width: "70%" }}
              />
              <h2 className="title">Hospital Portal</h2>
              <div className="dropdown">
                <button className="dropbtn">Select Portal</button>
                <div className="dropdown-content">
                  <button onClick={() => setView("patient")}>
                    Login as Patient
                  </button>
                  <button onClick={() => setView("doctor")}>
                    Login as Doctor
                  </button>
                  <button onClick={() => setView("signup")}>Sign Up</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return <div>{renderView()}</div>;
}

export default Dashboard;
