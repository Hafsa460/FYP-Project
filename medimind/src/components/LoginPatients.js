import React, { useState } from "react";
import "./Patients.css";
import coverimage from "../images/cover.png";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";

function LoginPatients() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateLogin = () => {
    if (username === "hafsa13" && password === "hafsa") {
      window.location.href = "../main/main.html";
    } else {
      alert("Incorrect username or password!");
    }
  };

  if (showSignUp) {
    return <SignUp />;
  }

  if (showForgotPassword) {
    return <ForgotPassword />;
  }

  return (
    <div className="first">
      <img src={coverimage} alt="Cover" className="new" />

      <input
        type="text"
        id="username"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        id="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="login-actions">
        <button className="btn" onClick={validateLogin}>
          Login
        </button>
        <button
          className="link-button"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>
      </div>

      <p className="signup-text">
        Don’t have an account?{" "}
        <button className="link-button" onClick={() => setShowSignUp(true)}>
          Sign up
        </button>
      </p>
    </div>
  );
}

export default LoginPatients;
