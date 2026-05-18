import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./AdminNavbar.css";

import coverimage from "../images/cover.png";
import maleProfile from "../images/male.png";
import femaleProfile from "../images/female.png";

function AdminNavbar({ adminInfo, activeTab, onTabChange, onLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const role = localStorage.getItem("adminRole");

  const profileIcon =
    adminInfo?.gender?.toLowerCase() === "male" ? maleProfile : femaleProfile;

  const goHome = () => {
    if (!role) return navigate("/adminLogin");

    switch (role) {
      case "doctorAdmin":
        navigate("/doctor-admin");
        break;
      case "patientAdmin":
        navigate("/patient-admin");
        break;
      case "departmentAdmin":
        navigate("/department-admin");
        break;
      case "superAdmin":
        navigate("/super");
        break;
      default:
        navigate("/adminLogin");
    }
  };

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
      className={`admin-nav-btn${active ? " active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <nav className="admin-navbar">
      {/* LOGO */}
      <div className="admin-logo">
        <Link to="/dash" className="admin-brand">
          <img src={coverimage} alt="KRL Hospital" />
          <span>KRL Hospital</span>
        </Link>
      </div>

      {/* NAV ITEMS */}
      <div className="admin-nav-links">
        {role === "superAdmin" ? (
          <>
            <NavButton
              active={activeTab === "dashboard"}
              onClick={() => onTabChange?.("dashboard")}
            >
              Dashboard
            </NavButton>
            <NavButton
              active={activeTab === "adminManagement"}
              onClick={() => onTabChange?.("adminManagement")}
            >
              Manage Admins
            </NavButton>
          </>
        ) : (
          <NavButton onClick={goHome}>Dashboard</NavButton>
        )}

        <NavButton onClick={() => navigate("/help-support")}>Help</NavButton>

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

        {/* LOGOUT ICON ONLY */}
        <button className="logout-icon-btn" onClick={handleLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
