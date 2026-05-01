import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../PatientAdmin/PatientAdmin.css";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";
import AdminNavbar from "../AdminNavbar";
import adminNotificationService from "../../services/AdminNotificationService";

function DepartmentAdminLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
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

        const res = await fetch("http://localhost:5000/api/admins/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.message) {
          const adminData = { name: "Department Admin", role: "deptAdmin", gender: "female", id: localStorage.getItem("Id") || "N/A" };
          setAdmin(adminData);
          // Load stored notifications for this admin
          const stored = adminNotificationService.getStoredNotifications(adminData.id);
          setNotifications(stored);
        } else {
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

  // Subscribe to notifications
  useEffect(() => {
    if (!admin) return;
    
    const unsubscribe = adminNotificationService.subscribe((notification) => {
      // Only add notifications for this admin
      if (notification.adminId === admin.id) {
        setNotifications(prev => [notification, ...prev]);
      }
    });

    return unsubscribe;
  }, [admin]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    navigate("/adminLogin");
  };

  return (
    <>
      <AdminNavbar adminInfo={admin} onLogout={handleLogout} />
      <div className={`admin-layout d-flex ${showNotifications ? "with-notifications" : ""}`}>
        <div className="sidebar p-3">
          <div className="admin-profile d-flex align-items-center mb-4">
            <img src={admin?.gender?.toLowerCase() === "female" ? femaleProfile : maleProfile} alt="Admin" className="profile-icon me-3" />
            <div className="admin-details fw-semibold">
              {loading ? "Loading..." : admin ? `${admin.name}` : "Department Admin"}
              <div className="text-muted small">ID: {admin?.id ?? "N/A"}</div>
              <div className="text-muted small">Role: {admin?.role ?? "deptAdmin"}</div>
            </div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/dept-admin" className="nav-link">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/dept-admin/departments" className="nav-link">Manage Departments</Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-link nav-link text-danger" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>

        <div className="content p-4 flex-grow-1 position-relative">
          <Outlet context={{ notify: adminNotificationService.notify.bind(adminNotificationService), admin }} />
          {!showNotifications && (
            <button className="btn btn-sm btn-info show-btn" onClick={() => setShowNotifications(true)}>Show Notifications</button>
          )}
        </div>

        {showNotifications ? (
          <div className="notification-panel p-3">
            <h5>Notifications</h5>
            <ul>
              {notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <li key={notif.id}>{notif.message}</li>
                ))
              ) : (
                <li>No notifications yet</li>
              )}
            </ul>
            <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setShowNotifications(false)}>Hide</button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default DepartmentAdminLayout;
