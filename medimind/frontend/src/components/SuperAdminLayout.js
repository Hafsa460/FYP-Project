import React, { useEffect, useState } from "react";
import SuperAdmin from "./SuperAdmin";
import "./superadmin.css";
import AdminNavbar from "./AdminNavbar";
import adminNotificationService from "../services/AdminNotificationService";

export default function SuperAdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const admin = {
    name: localStorage.getItem("adminName") || "Super Admin",
    role: localStorage.getItem("adminRole") || "superAdmin",
    id: localStorage.getItem("adminId") || "superAdmin",
  };

  useEffect(() => {
    const stored = adminNotificationService.getStoredNotifications(admin.id);
    setNotifications(stored);
  }, [admin.id]);

  useEffect(() => {
    const unsubscribe = adminNotificationService.subscribe((notification) => {
      if (notification.adminId === admin.id) {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    return unsubscribe;
  }, [admin.id]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminId");
    window.location.href = "/adminLogin";
  };

  return (
    <>
      <AdminNavbar
        adminInfo={admin}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <div
        className={`super-layout${showNotifications ? " with-notifications" : ""}`}
      >
        <div className="super-main">
          <SuperAdmin activeTab={activeTab} />

          {!showNotifications && (
            <button
              className="btn btn-sm btn-info show-btn"
              onClick={() => setShowNotifications(true)}
            >
              Show Notifications
            </button>
          )}
        </div>

        {showNotifications && (
          <div className="notification-panel p-3">
            <div className="notification-header d-flex justify-content-between align-items-center">
              <h5>Notifications</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowNotifications(false)}
              >
                Hide
              </button>
            </div>

            <ul className="list-unstyled mt-3">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <li key={notif.id} className="mb-3 notification-item">
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
          </div>
        )}
      </div>
    </>
  );
}
