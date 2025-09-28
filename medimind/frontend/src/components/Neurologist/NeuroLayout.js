import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";
import "./NeuroDashboard.css";

function NeuroLayout() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [doctor, setDoctor] = useState(null); // ✅ Store doctor details
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch logged-in doctor from backend
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        if (!token) {
          navigate("/login-doctor"); // if no token → go to login
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
        } else {
          console.error("Failed to fetch doctor:", data.error);
          navigate("/login-doctor");
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
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

  // ✅ Pick profile icon based on gender
  const profileIcon =
    doctor?.gender?.toLowerCase() === "male" ? maleProfile : femaleProfile;

  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <img
              src={profileIcon}
              alt="Doctor"
              className="profile-icon me-3"
            />
            <div className="doctor-name fw-semibold">
              {loading ? "Loading..." : doctor ? `${doctor.name}` : "Not Found"}
            </div>
          </div>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                to="/neuro-dashboard/appointment-schedule"
                className="nav-link"
              >
                Appointment Schedule
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/neuro-dashboard/verify-reports" className="nav-link">
                Verify Test Reports
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
