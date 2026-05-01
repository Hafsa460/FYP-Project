import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { User, FileText, Bell, Menu, X } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientDashboard.css";

const formatDate = (value) => {
  const date = new Date(value);
  return isNaN(date) ? "" : date.toLocaleDateString("en-GB");
};

function PatientLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (!storedPatient) {
      navigate("/login-patient");
      return;
    }

    const parsed = JSON.parse(storedPatient);
    setPatient(parsed);

    const patientId = parsed._id || parsed.id || parsed.mrNo;

    // Fetch appointments for notifications
    fetch(`http://localhost:5000/api/appointments/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) =>
        setAppointments(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : []
        )
      )
      .catch((err) => console.error(err));

    fetch(`http://localhost:5000/api/patient-prescriptions/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) =>
        setPrescriptions(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : []
        )
      )
      .catch((err) => console.error(err));

    // Fetch reports for notifications
    fetch(`http://localhost:5000/api/reports/patient/${parsed.mrNo}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) =>
        setReports(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.reports)
            ? data.reports
            : []
        )
      )
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("patient");
    localStorage.removeItem("token");
    navigate("/login-patient");
  };

  if (!patient) return <div className="p-4">Loading patient data...</div>;

  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        {/* Sidebar Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Notification Toggle Button */}
        <button
          className="notification-toggle"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          title={notificationsOpen ? "Hide Notifications" : "Show Notifications"}
        >
          {notificationsOpen ? <X size={24} /> : <Bell size={24} />}
        </button>

        {/* Sidebar */}
        <div className={`sidebar p-3 ${sidebarOpen ? "open" : "closed"}`}>
          <div className="doctor-profile d-flex align-items-center mb-4">
            <User className="me-3 text-primary" size={32} />
            <div className="doctor-name fw-semibold">{patient.name}</div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                to="/PatientDashboard"
                className="nav-link"
                onClick={() => {
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
              >
                <FileText className="me-2" size={16} /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/PatientDashboard/patient-records"
                className="nav-link"
                onClick={() => {
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
              >
                <FileText className="me-2" size={16} /> Patient Records
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/PatientDashboard/appointment"
                className="nav-link"
                onClick={() => {
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
              >
                <User className="me-2" size={16} /> Make Appointment
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/PatientDashboard/profile"
                className="nav-link"
                onClick={() => {
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
              >
                <User className="me-2" size={16} /> Profile Management
              </Link>
            </li>

            <li className="nav-item">
              <button
                className="btn btn-link nav-link text-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="content p-4 flex-grow-1">
          <Outlet context={{ patient, appointments }} />
        </div>

        {/* Notifications */}
        <div className={`notification-panel p-3 ${notificationsOpen ? "open" : "closed"}`}>
          <h5>
            <Bell className="me-2" size={18} />
            Notifications
          </h5>
          <ul>
            {(() => {
              const notifications = [];
              const safeAppointments = Array.isArray(appointments) ? appointments : [];
              const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];
              const safeReports = Array.isArray(reports) ? reports : [];

              // Add appointment notifications
              safeAppointments.slice(0, 3).forEach((appt, index) => {
                notifications.push(
                  `Appointment ${index + 1}: ${new Date(appt.date).toLocaleDateString()} at ${appt.time} with ${appt.doctorId?.name} (${appt.doctorId?.department})`
                );
              });

              // Add prescription notifications
              safePrescriptions.slice(0, 3).forEach((pres, index) => {
                const date = formatDate(pres.date || pres.createdAt);
                notifications.push(
                  `Prescription ${index + 1}:  Issued by ${pres.doctor?.name || "Unknown Doctor" } for ${pres.patient?.name || "patient"} on ${date || "Date unavailable"}`
                );
              });

              // Add report notifications
              safeReports.slice(0, 3).forEach((report, index) => {
                const date = formatDate(report.createdAt || report.date);
                notifications.push(
                  `Report ${index + 1}:  Verified by ${report.doctor?.name || "Unknown Doctor" } for ${report.patient?.name || "patient"} on ${date || "Date unavailable"}`
                );
              });

              return notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <li key={index}>{notif}</li>
                ))
              ) : (
                <li>No new notifications</li>
              );
            })()}
          </ul>
        </div>
      </div>
    </>
  );
}

export default PatientLayout;
