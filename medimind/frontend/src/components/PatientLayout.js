import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { User, FileText, Bell } from "lucide-react";
import { Calendar } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientDashboard.css";

function PatientLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
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
      .then((data) => setAppointments(data || []))
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
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <User className="me-3 text-primary" size={32} />
            <div className="doctor-name fw-semibold">{patient.name}</div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/PatientDashboard" className="nav-link">
                <FileText className="me-2" size={16} /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/PatientDashboard/appointment" className="nav-link">
                <User className="me-2" size={16} /> Make Appointment
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/PatientDashboard/view-prescriptions" className="nav-link">
                <FileText className="me-2" size={16} /> Prescriptions
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/PatientDashboard/my-reports" className="nav-link">
                <FileText className="me-2" size={16} /> Reports
              </Link>
            </li>
            <li className="nav-item">
  <Link to="/PatientDashboard/my-appointments" className="nav-link">
    <Calendar className="me-2" size={16} /> Appointments
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
        {showNotifications && (
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
        )}
        {!showNotifications && (
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

export default PatientLayout;
