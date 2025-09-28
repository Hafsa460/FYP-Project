import React, { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { ClipboardList, FileText, LogOut, User, Bell } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientDashboard.css";

function PatientDashboard() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      const parsed = JSON.parse(storedPatient);
      setPatient(parsed);

      const patientId = parsed._id || parsed.id || parsed.mrNo;
      if (!patientId) return;

      // Fetch ALL appointments for patient
      fetch(`http://localhost:5000/api/appointments/patient/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setAppointments(data))
        .catch((err) => console.error("Error fetching appointments:", err));

      // Fetch ALL prescriptions for patient
      fetch(`http://localhost:5000/api/prescriptions/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPrescriptions(data);
          } else {
            setPrescriptions([]);
          }
        })
        .catch((err) => console.error("Error fetching prescriptions:", err));
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!patient) {
    return <div className="p-4">Loading patient data...</div>;
  }
  const handleLogout = () => {
    localStorage.removeItem("patient");
    navigate("/login-patient");
  };
  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <User className="me-3 text-primary" size={32} />
            <div className="doctor-name fw-semibold">{patient.name}</div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/view-prescriptionspatient" className="nav-link">
                <FileText className="me-2" size={16} /> View Prescriptions
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/appointment" className="nav-link">
                <User className="me-2" size={16} /> Make an Appointment
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

        {/* Content */}
        <div className="content p-4 flex-grow-1">
          <div className="main-content">
            {/* Top Section */}
            <div className="top-section mb-4">
              <div className="d-flex align-items-center">
                <User className="me-3 text-primary" size={40} />
                <div>
                  <div className="fw-bold">{patient.name}</div>
                  <div className="text-muted">Age: {patient.age}</div>
                  <div className="text-secondary">
                    You have {appointments.length} appointments scheduled
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="card-grid mb-4">
              <div className="card">
                <div className="fw-bold">Appointments</div>
                <div className="fs-4">{appointments.length}</div>
              </div>
              <div className="card">
                <div className="fw-bold">Prescriptions</div>
                <div className="fs-4">{prescriptions.length}</div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="bottom-grid mt-4">
              {/* Appointment History */}
              <div className="chart-section small-card">
                <div className="section-title">Upcoming Appointments</div>
                {appointments.length > 0 ? (
                  <ul>
                    {appointments.map((appt) => (
                      <li key={appt._id}>
                        {appt.doctorId?.name} – {appt.doctorId?.department} –{" "}
                        {new Date(appt.date).toLocaleDateString()} at{" "}
                        {appt.time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming appointments</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {showNotifications ? (
          <div className="notification-panel p-3">
            <h5>
              <Bell className="me-2" size={18} />
              Notifications
            </h5>
            <ul>
              {appointments.length > 0 ? (
                appointments.slice(0, 5).map((appt, index) => (
                  <li key={appt._id}>
                    Appointment {index + 1}:{" "}
                    {new Date(appt.date).toLocaleDateString()} at {appt.time}{" "}
                    with {appt.doctorId?.name} ({appt.doctorId?.department})
                  </li>
                ))
              ) : (
                <li>No upcoming appointments</li>
              )}
            </ul>

            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => setShowNotifications(false)}
            >
              Hide
            </button>
          </div>
        ) : (
          <button
            className="btn btn-sm btn-info show-btn"
            onClick={() => setShowNotifications(true)}
          >
            Show Notifications
          </button>
        )}
      </div>
    </>
  );
}

export default PatientDashboard;
