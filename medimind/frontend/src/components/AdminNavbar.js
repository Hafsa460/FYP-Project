import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

import coverimage from "../images/cover.png";
import maleProfile from "../images/male.png";
import femaleProfile from "../images/female.png";

function AdminNavbar({ adminInfo, activeTab, onTabChange, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const role = localStorage.getItem("adminRole");

  const profileIcon =
    adminInfo?.gender?.toLowerCase() === "male" ? maleProfile : femaleProfile;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    navigate("/adminLogin");
  };

  const NavButton = ({ children, onClick, active }) => (
    <button
      className={`nav-link btn btn-link text-teal${active ? " active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <nav className="admin-navbar">
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
        {/* SuperAdmin section tabs */}
        {onTabChange && (
          <>
            <NavButton
              active={activeTab === "dashboard"}
              onClick={() => onTabChange("dashboard")}
            >
              Dashboard
            </NavButton>

            <NavButton
              active={activeTab === "superAdmins"}
              onClick={() => onTabChange("superAdmins")}
            >
              Super Admins
            </NavButton>

            <NavButton
              active={activeTab === "adminManagement"}
              onClick={() => onTabChange("adminManagement")}
            >
              Manage Admins
            </NavButton>
          </>
        )}

        {/* LOGOUT BUTTON */}
        <button
          className="logout-btn btn btn-link text-teal"
          onClick={handleLogout}
        >
          Logout
        </button>

        {/* PROFILE */}
        <div className="admin-profile">
          <img
            src={profileIcon}
            alt="profile"
            onClick={() => setShowDropdown(!showDropdown)}
          />

          {showDropdown && (
            <div className="admin-dropdown">
              <p>{adminInfo?.name || "Admin"}</p>
              <p className="role">{role}</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
