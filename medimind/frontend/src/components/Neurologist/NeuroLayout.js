import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import femaleProfile from "../../images/female.png";
import "./NeuroDashboard.css";

function NeuroLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
    navigate("/login-doctor");
  };

  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <img src={femaleProfile} alt="Doctor" className="profile-icon me-3" />
            <div className="doctor-name fw-semibold">Dr. Sara</div>
          </div>
          <ul className="nav flex-column">
            {/* ✅ New Appointment Schedule Link */}
            <li className="nav-item">
              <Link to="/neuro-dashboard/appointment-schedule" className="nav-link">
                📅 Appointment Schedule
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/neuro-dashboard/verify-reports" className="nav-link">
                Verify Test Reports
              </Link>
            </li>

            {/* Prescription Dropdown */}
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
                      ➕ Add Prescription
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/neuro-dashboard/view" className="nav-link">
                      📄 View Prescriptions
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className="nav-item">
              <Link to="/neuro-dashboard/profile-management" className="nav-link">
                Profile Management
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
          <Outlet />
        </div>

        {/* Notification Panel */}
        {showNotifications ? (
          <div className="notification-panel p-3">
            <h5>Notifications</h5>
            <ul>
              <li>Patient A report is pending.</li>
              <li>New appointment booked.</li>
              <li>Profile updated.</li>
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

export default NeuroLayout;
