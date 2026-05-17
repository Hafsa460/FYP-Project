import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import "./AdminNavbar.css";
import coverimage from "../images/cover.png";
import maleProfile from "../images/male.png";
import femaleProfile from "../images/female.png";

function AdminNavbar({ adminInfo, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const profileIcon =
    adminInfo?.gender?.toLowerCase() === "male" ? maleProfile : femaleProfile;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminInfo");
    if (onLogout) onLogout();
    navigate("/adminLogin");
  };

  const handleScrollTo = (id) => {
    const target = { pathname: "/dash", hash: `#${id}` };

    if (location.pathname !== "/dash" || location.hash !== `#${id}`) {
      navigate(target);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `${target.pathname}${target.hash}`);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light px-4 shadow-sm"
      style={{ height: "80px" }}
    >
      {/* LOGO */}
      <div className="d-flex align-items-center">
        <Link className="navbar-brand d-flex align-items-center" to="/dash">
          <img src={coverimage} alt="MediMind Logo" style={{ width: "80px" }} />
        </Link>
        <Link to="/dash" className="text-decoration-none">
          <strong className="text-teal">MediMind Admin</strong>
        </Link>
      </div>

      {/* LINKS AND AUTH */}
      <div className="ms-auto d-flex align-items-center gap-4">
        {/* Navigation Buttons */}
        <button
          className="nav-link btn btn-link text-teal"
          onClick={() => {
            if (location.pathname !== "/dash") {
              navigate("/dash");
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 200);
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
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

        {/* Admin Profile Dropdown */}
        <div className="position-relative">
          <img
            src={profileIcon}
            alt="Admin Profile"
            className="rounded-circle"
            style={{ width: "45px", cursor: "pointer", objectFit: "cover" }}
            onClick={() => setShowDropdown(!showDropdown)}
          />

          {showDropdown && (
            <div className="dropdown-menu dropdown-menu-end show admin-dropdown">
              <p className="dropdown-item-text fw-bold text-center">
                {adminInfo?.name || "Admin"}
              </p>
              <div className="dropdown-item-text text-muted small text-center">
                ID: {adminInfo?.id || "N/A"}
              </div>
              <div className="dropdown-item-text text-muted small text-center">
                Role: {adminInfo?.role || "N/A"}
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                <LogOut size={14} className="me-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
