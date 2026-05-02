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
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("doctorToken");

        if (!token) {
          navigate("/login-doctor");
          return;
        }

        const res = await fetch("http://localhost:5000/api/doctor-auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setDoctor(data.doctor);

          // Upcoming appointments
          const apptRes = await fetch(
            `http://localhost:5000/api/doctor-auth/${data.doctor._id}/upcoming`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!apptRes.ok) {
            console.error("Failed to fetch appointments");
            setAppointments([]);
          } else {
            const apptData = await apptRes.json();
            if (apptData.success) {
              setAppointments(apptData.appointments);
            }
          }

          // Prescriptions
          const presRes = await fetch(
            `http://localhost:5000/api/doctor-auth/${data.doctor._id}/prescriptions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const presData = await presRes.json();

          if (presData.success) {
            setPrescriptions(presData.prescriptions.slice(-5));
          }

          // Reports
          const reportRes = await fetch(
            `http://localhost:5000/api/doctor-auth/${data.doctor._id}/reports`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const reportData = await reportRes.json();

          if (reportData.success) {
            setReports(reportData.reports.slice(0, 5));
          }
        } else {
          navigate("/login-doctor");
        }
      } catch (error) {
        console.error(error);
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

      <div
        className={`neuro-dashboard d-flex ${
          showNotifications ? "with-notifications" : ""
        }`}
      >
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-header">
            <img src={profileIcon} alt="Doctor" className="profile-icon" />

            <div className="sidebar-meta">
              <div className="doctor-name fw-semibold">
                {loading ? "Loading..." : doctor ? doctor.name : "Not Found"}
              </div>

              <div className="doctor-role text-muted">
                {doctor?.designation || "Neurologist"}
              </div>
            </div>
          </div>

          <ul className="sidebar-menu">
            <li>
              <Link
                to="/neuro-dashboard/appointment-schedule"
                className="sidebar-link"
              >
                Appointment Schedule
              </Link>
            </li>

            {doctor?.department?.toLowerCase() === "neurology" && (
              <li>
                <Link
                  to="/neuro-dashboard/verify-reports"
                  className="sidebar-link"
                >
                  Verify Test Reports
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/neuro-dashboard/profile-management"
                className="sidebar-link"
              >
                Profile Management
              </Link>
            </li>

            <li>
              <button
                className="sidebar-link sidebar-button"
                onClick={() => setPrescriptionOpen(!prescriptionOpen)}
              >
                <span>Prescription Management</span>
                <span>{prescriptionOpen ? "▲" : "▼"}</span>
              </button>

              {prescriptionOpen && (
                <ul className="nested-links">
                  <li>
                    <Link to="/neuro-dashboard/add" className="sidebar-link">
                      Add Prescription
                    </Link>
                  </li>

                  <li>
                    <Link to="/neuro-dashboard/view" className="sidebar-link">
                      View Prescriptions
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button
                className="sidebar-link logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="content p-4 flex-grow-1 position-relative">
          <Outlet />

          {!showNotifications && (
            <button
              className="show-btn"
              onClick={() => setShowNotifications(true)}
            >
              Show Notifications
            </button>
          )}
        </div>

        {/* NOTIFICATION PANEL */}
        {showNotifications && (
          <div className="notification-panel p-3">
            <h5>Notifications</h5>

            <ul>
              {(() => {
                const notifications = [];

                appointments.slice(0, 3).forEach((appt, index) => {
                  const date = formatDate(appt.date);

                  notifications.push(
                    `Appointment ${index + 1}: ${
                      date || "Date unavailable"
                    } at ${appt.time} with ${
                      appt.patientId?.name || "Unknown Patient"
                    }`,
                  );
                });

                prescriptions.slice(0, 3).forEach((pres, index) => {
                  const date = formatDate(pres.date || pres.createdAt);

                  notifications.push(
                    `Prescription ${index + 1}: Issued by ${
                      doctor?.name || "Unknown Doctor"
                    } for ${
                      pres.patient?.name || "Unknown Patient"
                    } on ${date || "Date unavailable"}`,
                  );
                });

                reports.slice(0, 3).forEach((report, index) => {
                  const date = formatDate(report.createdAt || report.date);

                  notifications.push(
                    `Report ${index + 1}: Verified by ${
                      doctor?.name || "Unknown Doctor"
                    } for ${
                      report.patient?.name || "Unknown Patient"
                    } on ${date || "Date unavailable"}`,
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
        )}
      </div>
    </>
  );
}

export default NeuroLayout;
