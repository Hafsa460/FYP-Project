// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import coverimage from "../images/cover.png";
import maleProfile from "../images/male.png";
import femaleProfile from "../images/female.png";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem("doctor") || "null");
    const patient = JSON.parse(localStorage.getItem("patient") || "null");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    const adminToken = localStorage.getItem("adminToken");
    const adminRole = localStorage.getItem("adminRole");
    const adminName = localStorage.getItem("adminName");

    if (doctor) {
      setUserType("doctor");
      setUser(doctor);
    } else if (patient) {
      setUserType("patient");
      setUser(patient);
    } else if (admin || adminToken) {
      setUserType("admin");
      setUser(
        admin || {
          name: adminName || "Admin",
          role: adminRole || "admin",
        },
      );
    } else {
      setUserType(null);
      setUser(null);
    }

    setShowDropdown(false);
  }, [location.pathname]);

  const profileIcon =
    user?.gender?.toLowerCase() === "female" ? femaleProfile : maleProfile;

  const handleLogout = () => {
    localStorage.clear();
    setUserType(null);
    setUser(null);
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (userType === "doctor") return "/neuro-dashboard";
    if (userType === "patient") return "/PatientDashboard";
    if (userType === "admin") {
      const adminRole = localStorage.getItem("adminRole");
      if (adminRole === "doctorAdmin") return "/doctor-admin";
      if (adminRole === "patientAdmin") return "/patient-admin";
      if (adminRole === "departmentAdmin") return "/dept-admin";
      if (adminRole === "superAdmin") return "/super";
      return "/";
    }
    return "/";
  };

  // ✅ FINAL SCROLL HANDLER (HASH BASED — STABLE)
  const handleScrollTo = (id) => {
    window.location.hash = id;
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm"
      style={{ height: "80px" }}
    >
      {/* LOGO */}
      <div className="d-flex align-items-center">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={coverimage} alt="KRL Hospital" style={{ width: "80px" }} />
        </Link>
        <Link to="/" className="text-decoration-none">
          <strong className="text-teal">KRL Hospital</strong>
        </Link>
      </div>

      {/* LINKS */}
      <div className="ms-auto d-flex align-items-center gap-4">
        <button
          className="nav-link btn btn-link text-teal"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Home
        </button>

        <button
          className="nav-link btn btn-link text-teal"
          onClick={() => handleScrollTo("departments")}
        >
          Departments
        </button>

        <button
          className="nav-link btn btn-link text-teal"
          onClick={() => handleScrollTo("doctors")}
        >
          Doctors
        </button>

        <button
          className="nav-link btn btn-link text-teal"
          onClick={() => handleScrollTo("contact")}
        >
          About Us
        </button>
        <button
          className="nav-link btn btn-link text-teal"
          onClick={() => navigate("/help-support")}
        >
          Help & Support
        </button>

        {userType && (
          <Link to={getDashboardRoute()} className="btn btn-outline-teal">
            Dashboard
          </Link>
        )}

        {!userType && (
          <Link to="/Login-option" className="btn btn-teal">
            Login / Sign Up
          </Link>
        )}

        {userType && (
          <div className="position-relative">
            <img
              src={profileIcon}
              alt={user?.name ? `${user.name} profile` : "Profile"}
              className="rounded-circle"
              style={{ width: "45px", cursor: "pointer" }}
              onClick={() => setShowDropdown((prev) => !prev)}
            />

            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-end show">
                <p className="dropdown-item-text fw-bold text-center">
                  {user?.name}
                </p>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
