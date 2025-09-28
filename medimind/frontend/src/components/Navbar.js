import React from "react";
import { Link, useLocation } from "react-router-dom";
import coverimage from "../images/cover.png";
import "./Navbar.css";
function Navbar() {
  const location = useLocation();
  // Check if any user is logged in
  const isLoggedIn = Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("doctorToken") ||
      localStorage.getItem("adminToken")
  );
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm"
      style={{ paddingTop: "0.4rem", paddingBottom: "0.4rem", height: "80px" }}
    >
      <div className="d-flex align-items-center">
        <Link
          className="navbar-brand fw-bold text-primary d-flex align-items-center"
          to="/"
        >
          <img
            src={coverimage}
            alt="KRL Hospital"
            className="me-2"
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />
        </Link>
        <Link to="/" className="text-decoration-none">
          <span className="text-teal">
            <strong>KRL Hospital</strong>
          </span>
        </Link>
      </div>
      <div className="ms-auto d-flex">
        {(!isLoggedIn || location.pathname === "/dash") && (
          <Link
            to="/Login-option"
            className="btn  me-2  btn-teal text-teal btn-teal:hover"
          >
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
