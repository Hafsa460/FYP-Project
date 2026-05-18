// src/components/PatientAdmin/PatientAdminLayout.js
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./PatientAdmin.css";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";
import AdminNavbar from "../AdminNavbar";
import adminNotificationService from "../../services/AdminNotificationService";

function PatientAdminLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ ROLE-BASED DASHBOARD ROUTE
  const getDashboardRoute = () => {
    const adminRole = localStorage.getItem("adminRole");

    if (adminRole === "doctorAdmin") return "/doctor-admin";
    if (adminRole === "patientAdmin") return "/patient-admin";
    if (adminRole === "departmentAdmin") return "/dept-admin";
    if (adminRole === "superAdmin") return "/super";

    return "/";
  };

  // ✅ FETCH ADMIN DATA
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/adminLogin");
          return;
        }

        const res = await fetch("http://localhost:5000/api/admins/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.message) {
          const adminData = {
            name: localStorage.getItem("adminName") || "Admin",
            role: localStorage.getItem("adminRole") || "patientAdmin",
            gender: "female",
            id: localStorage.getItem("adminId") || "N/A",
          };

          setAdmin(adminData);

          const stored = adminNotificationService.getStoredNotifications(
            adminData.id,
          );

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

  // ✅ LIVE NOTIFICATIONS
  useEffect(() => {
    if (!admin) return;

    const unsubscribe = adminNotificationService.subscribe((notification) => {
      if (notification.adminId === admin.id) {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    return unsubscribe;
  }, [admin]);

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminId");

    navigate("/adminLogin");
  };

  return (
    <>
      <AdminNavbar adminInfo={admin} onLogout={handleLogout} />

      <div className="admin-layout d-flex">
        {/* ================= SIDEBAR ================= */}
        <div className="sidebar p-3">
          {/* PROFILE SECTION */}
          <div className="admin-profile d-flex align-items-center mb-4">
            <img
              src={
                admin?.gender?.toLowerCase() === "female"
                  ? femaleProfile
                  : maleProfile
              }
              alt="Admin"
              className="profile-icon me-3"
            />

            <div className="admin-details fw-semibold">
              {loading ? "Loading..." : admin?.name || "Admin"}

              <div className="text-muted small">
                Role: {admin?.role || "patientAdmin"}
              </div>

              <div className="text-muted small">ID: {admin?.id || "N/A"}</div>
            </div>
          </div>

          {/* NAV LINKS */}
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/patient-admin/patients" className="nav-link">
                Manage Patients
              </Link>
            </li>

            {/* ROLE BASED DASHBOARD */}
            <li className="nav-item">
              <Link to={getDashboardRoute()} className="nav-link fw-semibold">
                Main Dashboard
              </Link>
            </li>

            <li className="nav-item mt-3">
              <button
                className="btn btn-link nav-link text-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="content p-4 flex-grow-1 position-relative">
          <Outlet
            context={{
              notify: adminNotificationService.notify.bind(
                adminNotificationService,
              ),
              admin,
            }}
          />

          {!showNotifications && (
            <button
              className="btn btn-sm btn-info show-btn"
              onClick={() => setShowNotifications(true)}
            >
              Show Notifications
            </button>
          )}
        </div>

        {/* ================= NOTIFICATIONS ================= */}
        {showNotifications && (
          <div className="notification-panel p-3">
            <h5>Notifications</h5>

            <ul className="list-unstyled">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <li key={notif.id} className="mb-2">
                    <div>{notif.message}</div>

                    <div className="text-muted small">
                      {notif.timestamp
                        ? new Date(notif.timestamp).toLocaleDateString("en-GB")
                        : ""}
                    </div>
                  </li>
                ))
              ) : (
                <li>No notifications yet</li>
              )}
            </ul>

            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => setShowNotifications(false)}
            >
              Hide
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default PatientAdminLayout;
