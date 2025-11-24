// src/components/DoctorAdmin/DoctorAdminLayout.js
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";
import "./DoctorAdmin.css";

function DoctorAdminLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/adminLogin");
          return;
        }

        const res = await fetch("http://localhost:5000/api/doctor-admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          setAdmin(data.admin);
        } else {
          console.error("Failed to fetch admin:", data.error);
          navigate("/adminLogin");
        }
      } catch (err) {
        console.error("Error fetching admin:", err);
        navigate("/adminLogin");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/adminLogin");
  };

  const profileIcon = admin?.gender?.toLowerCase() === "female" ? femaleProfile : maleProfile;

  return (
    <div className="admin-layout d-flex">

      {/* Sidebar */}
      <div className="sidebar p-3">
        <div className="admin-profile d-flex align-items-center mb-4">
          <img src={profileIcon} alt="Admin" className="profile-icon me-3" />
          <div className="admin-details fw-semibold">
            {loading ? "Loading..." : admin ? `${admin.name}` : "Doctor Admin"}
            <div className="text-muted small">ID: {admin?.id ?? "N/A"}</div>
            <div className="text-muted small">Role: {admin?.role ?? "N/A"}</div>
          </div>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/doctor-admin" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/doctor-admin/manage" className="nav-link">Manage Doctors</Link>


          </li>
          <li className="nav-item">
            <Link to="/doctor-admin/notifications" className="nav-link">Notifications</Link>
          </li>
          <li className="nav-item">
            <button className="btn btn-link nav-link text-danger" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content p-4 flex-grow-1">
        <Outlet />
      </div>

      {/* Notification Panel */}
      {showNotifications ? (
        <div className="notification-panel p-3">
          <h5>Notifications</h5>
          <ul>
            <li>New doctor registered.</li>
            <li>Report verified successfully.</li>
          </ul>
          <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setShowNotifications(false)}>Hide</button>
        </div>
      ) : (
        <button className="btn btn-sm btn-info show-btn" onClick={() => setShowNotifications(true)}>Show Notifications</button>
      )}
    </div>
  );
}

export default DoctorAdminLayout;
