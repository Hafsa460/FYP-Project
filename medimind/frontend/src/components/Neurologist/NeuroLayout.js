import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";
import "./NeuroDashboard.css";

function NeuroLayout() {
  const formatDate = (value) => {
    const date = new Date(value);
    return isNaN(date) ? "" : date.toLocaleDateString("en-GB");
  };

  const [showNotifications, setShowNotifications] = useState(true);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]); // ✅ Store upcoming appointments
  const [prescriptions, setPrescriptions] = useState([]); // ✅ Store recent prescriptions
  const [reports, setReports] = useState([]); // ✅ Store recent reports
  const navigate = useNavigate();

  // Fetch logged-in doctor
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        if (!token) {
          navigate("/login-doctor");
          return;
        }

        const res = await fetch("http://localhost:5000/api/doctor-auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          setDoctor(data.doctor);

          // Fetch upcoming appointments for this doctor
   const apptRes = await fetch(
  `http://localhost:5000/api/doctor-auth/${data.doctor._id}/upcoming`,
  { headers: { Authorization: `Bearer ${token}` } }
);

if (!apptRes.ok) {
  console.error("Failed to fetch appointments:", apptRes.status);
  setAppointments([]); // fallback
  return;
}

const apptData = await apptRes.json();
if (apptData.success) setAppointments(apptData.appointments);

          // Fetch recent prescriptions by this doctor
          const presRes = await fetch(
            `http://localhost:5000/api/doctor-auth/${data.doctor._id}/prescriptions`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const presData = await presRes.json();
          if (presData.success) setPrescriptions(presData.prescriptions.slice(-5)); // Last 5

          // Fetch recent reports by this doctor
          const reportRes = await fetch(
            `http://localhost:5000/api/doctor-auth/${data.doctor._id}/reports`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const reportData = await reportRes.json();
          if (reportData.success) setReports(reportData.reports.slice(0, 5)); // Last 5

        } else {
          navigate("/login-doctor");
        }
      } catch (err) {
        console.error(err);
        navigate("/login-doctor");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
    navigate("/login-doctor");
  };

  const profileIcon =
    doctor?.gender?.toLowerCase() === "male" ? maleProfile : femaleProfile;

  return (
    <>
      <Navbar />
      <div className={`neuro-dashboard d-flex ${showNotifications ? "with-notifications" : ""}`}>
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <img src={doctor?.gender?.toLowerCase() === "female" ? femaleProfile : maleProfile} alt="Doctor" className="profile-icon me-3" />
            <div className="doctor-name fw-semibold">
              {loading ? "Loading..." : doctor ? doctor.name : "Not Found"}
            </div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="/neuro-dashboard/appointment-schedule" className="nav-link">
                Appointment Schedule
              </Link>
            </li>
            {doctor?.department?.toLowerCase() === "neurology" && (
  <li className="nav-item">
    <Link to="/neuro-dashboard/verify-reports" className="nav-link">
      Verify Test Reports
    </Link>
  </li>
)}

                              <li className="nav-item">
                    <Link to="/neuro-dashboard/profile-management" className="nav-link">
                      Profile Management
                    </Link>
                  </li>
            <li className="nav-item">
              <button
                className="btn btn-link nav-link d-flex justify-content-between align-items-center"
                onClick={() => setPrescriptionOpen(!prescriptionOpen)}
              >
                Prescription Management
                <span>{prescriptionOpen ? "▲" : "▼"}</span>
              </button>
              {prescriptionOpen && (
                <ul className="nav flex-column ms-3">
                  <li className="nav-item">
                    <Link to="/neuro-dashboard/add" className="nav-link">
                      Add Prescription
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/neuro-dashboard/view" className="nav-link">
                      View Prescriptions
                    </Link>
                  </li>

                </ul>
              )}
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
        <div className="content p-4 flex-grow-1 position-relative">
          <Outlet />
          {!showNotifications && (
            <button
              className="btn btn-sm btn-info show-btn"
              onClick={() => setShowNotifications(true)}
            >
              Show Notifications
            </button>
          )}
        </div>

        {/* Notification Panel */}
        {showNotifications ? (
          <div className="notification-panel p-3">
            <h5>Notifications</h5>
            <ul>
              {(() => {
                const notifications = [];

                // Add appointment notifications
                appointments.slice(0, 3).forEach((appt, index) => {
                  const date = formatDate(appt.date);
                  notifications.push(
                    `Appointment ${index + 1}: ${date || "Date unavailable"} at ${appt.time} with ${appt.patientId?.name || "Unknown Patient"}`
                  );
                });

                // Add prescription notifications
                prescriptions.slice(0, 3).forEach((pres, index) => {
                  const date = formatDate(pres.date || pres.createdAt);
                  notifications.push(
                    `Prescription ${index + 1}: Issued by ${doctor?.name || "Unknown Doctor"} for ${pres.patient?.name || "Unknown Patient"} on ${date || "Date unavailable"}`
                  );
                });

                // Add report notifications
                reports.slice(0, 3).forEach((report, index) => {
                  const date = formatDate(report.createdAt || report.date);
                  notifications.push(
                    `Report ${index + 1}: Verified by ${doctor?.name || "Unknown Doctor"} for ${report.patient?.name || "Unknown Patient"} on ${date || "Date unavailable"}`
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
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={() => setShowNotifications(false)}
            >
              Hide
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default NeuroLayout;
