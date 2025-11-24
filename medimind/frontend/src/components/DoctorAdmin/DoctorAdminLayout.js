import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./DoctorAdmin.css";

function DoctorAdminLayout() {
  const [adminName, setAdminName] = useState("");
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      // redirect to admin login if you want
      // navigate("/adminLogin");
      return;
    }
    // decode minimal info (name stored in token) or call admin API. We will not call for now.
    try {
      const raw = localStorage.getItem("adminInfo");
      if (raw) {
        const info = JSON.parse(raw);
        setAdminName(info.name || "");
      }
    } catch (err) {}
    // fetch notifications
    const fetchNotes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/doctor-admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setNotifications(data.notifications || []);
      } catch (err) {
        console.error("fetch notes", err);
      }
    };
    fetchNotes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/adminLogin");
  };

  return (
    <div className="doc-admin-layout d-flex">
      <div className="sidebar p-3">
        <div className="admin-profile mb-4">
          <div className="admin-name">{adminName || "Doctor Admin"}</div>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item"><Link to="/doctor-admin" className="nav-link">Dashboard</Link></li>
          <li className="nav-item"><Link to="/doctor-admin" className="nav-link">Doctors</Link></li>
          <li className="nav-item"><Link to="/doctor-admin" className="nav-link">Notifications</Link></li>
          <li className="nav-item"><button className="btn btn-link nav-link text-danger" onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>

      <div className="content p-4 flex-grow-1">
        <Outlet />
      </div>

      <div className="notification-panel p-3">
        <h5>Notifications</h5>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {notifications.length === 0 && <div>No notifications</div>}
          <ul>
            {notifications.map((n, idx) => (
              <li key={idx} className="note-item">
                <div>{n.message}</div>
                <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setShowNotifications(false)}>Hide</button>
      </div>
    </div>
  );
}

export default DoctorAdminLayout;
