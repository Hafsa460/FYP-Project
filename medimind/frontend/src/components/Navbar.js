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

  const [userType, setUserType] = useState(null); // "doctor", "patient", "admin"
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Detect logged-in user
    const doctor = JSON.parse(localStorage.getItem("doctor") || "null");
    const patient = JSON.parse(localStorage.getItem("patient") || "null");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");

    if (doctor) {
      setUserType("doctor");
      setUser(doctor);
    } else if (patient) {
      setUserType("patient");
      setUser(patient);
    } else if (admin) {
      setUserType("admin");
      setUser(admin);
    } else {
      setUserType(null);
      setUser(null);
    }
  }, [location]); // run whenever route changes

  // Choose profile icon based on gender
  let profileIcon = maleProfile;
  if (user?.gender?.toLowerCase() === "female") profileIcon = femaleProfile;

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("patient");
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    setUserType(null);
    setUser(null);
    navigate("/"); // return to landing
  };

  // Scroll to section helper
  const handleScrollTo = (id) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm"
      style={{ paddingTop: "0.4rem", paddingBottom: "0.4rem", height: "80px" }}
    >
      <div className="d-flex align-items-center">
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/">
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

      <div className="ms-auto d-flex align-items-center gap-4">
        {/* Navbar Links */}
        <button className="nav-link text-teal btn btn-link" onClick={() => navigate("/")}>
          Home
        </button>
        <button className="nav-link text-teal btn btn-link" onClick={() => handleScrollTo("departments")}>
          Departments
        </button>
        <button className="nav-link text-teal btn btn-link" onClick={() => handleScrollTo("doctors")}>
          Doctors
        </button>
        <button className="nav-link text-teal btn btn-link" onClick={() => handleScrollTo("contact")}>
          Contact
        </button>

        {/* Login / Sign Up */}
        {!userType && (
          <Link
            to="/Login-option"
            className="btn me-2 btn-teal text-teal btn-teal:hover"
          >
            Login / Sign Up
          </Link>
        )}

        {/* Profile icon + dropdown */}
        {userType && (
          <div className="position-relative">
            <img
              src={profileIcon}
              alt="Profile"
              className="rounded-circle"
              style={{ width: "45px", height: "45px", cursor: "pointer" }}
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div
                className="dropdown-menu dropdown-menu-end show"
                style={{ position: "absolute", right: 0 }}
              >
                <p className="dropdown-item-text mb-0 text-center fw-bold">
                  {user.name}
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
