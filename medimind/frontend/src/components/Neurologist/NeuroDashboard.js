import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import "./NeuroDashboard.css";
import femaleProfile from "../../images/female.png";
import VerifyReports from "./VerifyReports";
import PrescriptionHistory from "./PrescriptionHistory";
import ProfileManagement from "./ProfileManagement";
import Logout from "./Logout";
import Navbar from "../Navbar";

function NeuroDashboard() {
  const [showNotifications, setShowNotifications] = useState(true);

  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <img
              src={femaleProfile}
              alt="Female Doctor"
              className="profile-icon me-3"
            />
            <div className="doctor-name fw-semibold">Dr. Sara</div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link to="verify-reports" className="nav-link">
                Verify Test Reports
              </Link>
            </li>
            <li className="nav-item">
              <Link to="prescription-history" className="nav-link">
                View Prescription History
              </Link>
            </li>
            <li className="nav-item">
              <Link to="profile-management" className="nav-link">
                Profile Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to="logout" className="nav-link">
                Logout
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="content p-4 flex-grow-1">
          <div className="main-content">
            {/* Top Section */}
            <div className="top-section">
              <div className="d-flex align-items-center">
                <img
                  src={femaleProfile}
                  alt="Doctor"
                  className="profile-icon me-3"
                />
                <div>
                  <div className="fw-bold">Dr. Sara</div>
                  <div className="text-muted">Qualifications</div>
                  <div className="text-secondary">
                    You have 19 appointments today
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="card-grid">
              <div className="card">
                <div className="fw-bold">Patients</div>
                <div className="fs-4">156</div>
              </div>
              <div className="card">
                <div className="fw-bold">Appointments</div>
                <div className="fs-4">2,318</div>
              </div>
              <div className="card">
                <div className="fw-bold">Reports</div>
                <div className="fs-4">156</div>
              </div>
            </div>

            {/* Bottom Grid (Patient Type + Achievements) */}
            <div className="bottom-grid mt-4">
              {/* Patient Type */}
              <div className="chart-section small-card">
                <div className="section-title">Patient Type</div>
                <p>
                  • Male – 50%
                  <br />• Female – 50%
                </p>
              </div>

              {/* Achievements */}
              <div className="block-section flex-grow-1 ms-3">
                <div className="section-title">Achievements</div>
                <table className="table table-bordered mb-0" id="id3">
                  <thead>
                    <tr>
                      <th>Achievement</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>award1</td>
                      <td>2021</td>
                    </tr>
                    <tr>
                      <td>award2</td>
                      <td>2022</td>
                    </tr>
                    <tr>
                      <td>award3</td>
                      <td>2019</td>
                    </tr>
                    <tr>
                      <td>award4</td>
                      <td>2019</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Route Content */}
          <Routes>
            <Route path="verify-reports" element={<VerifyReports />} />
            <Route
              path="prescription-history"
              element={<PrescriptionHistory />}
            />
            <Route path="profile-management" element={<ProfileManagement />} />
            <Route path="logout" element={<Logout />} />
          </Routes>
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

export default NeuroDashboard;
