import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, FileText, LogOut, User, Bell, Calendar } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientDashboard.css";

function PatientDashboard() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const storedPatient = localStorage.getItem("patient");
      const token = localStorage.getItem("token");

      if (!storedPatient) {
        navigate("/login-patient");
        return;
      }

      const parsedPatient = JSON.parse(storedPatient);
      setPatient(parsedPatient);

      const patientId = parsedPatient._id;
      if (!patientId) return;

      try {
        // Fetch appointments
        const apptRes = await fetch(`http://localhost:5000/api/appointments/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!apptRes.ok) throw new Error("Failed to fetch appointments");
        const apptData = await apptRes.json();
        setAppointments(Array.isArray(apptData) ? apptData : []);

        // Fetch prescriptions
       const presRes = await fetch(`http://localhost:5000/api/patient-prescriptions/patient/${patientId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        if (!presRes.ok) throw new Error("Failed to fetch prescriptions");
        const presData = await presRes.json();
        setPrescriptions(Array.isArray(presData) ? presData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("patient");
    localStorage.removeItem("token");
    navigate("/login-patient");
  };

  if (loading) {
    return <div className="p-4">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="p-4">No patient data found.</div>;
  }

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
              <Link to="/my-reports" className="nav-link">
                <FileText className="me-2" size={16} /> My Reports
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/patient-profile" className="nav-link">
                <User className="me-2" size={16} /> Profile Management
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
              <div className="chart-section small-card">
                <div className="section-title">Upcoming Appointments</div>
                {appointments.length > 0 ? (
                  <ul>
                    {appointments.map((appt) => (
                      <li key={appt._id}>
                        {appt.doctorId?.name} – {appt.doctorId?.department} –{" "}
                        {new Date(appt.date).toLocaleDateString()} at {appt.time}
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
