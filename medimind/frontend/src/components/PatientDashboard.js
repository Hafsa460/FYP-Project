import React, { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  LogOut,
  User,
  Calendar,
  Bell,
} from "lucide-react";
import Navbar from "./Navbar";

// Import your patient pages
import ViewPrescriptions from "./Neurologist/PrescriptionHistory";
import TestReports from "./TestReport";
import Appointment from "./Appointments";

function PatientDashboard() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!patient) {
    return <div className="p-4">Loading patient data...</div>;
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
              <Link to="view-prescriptions" className="nav-link">
                <FileText className="me-2" size={16} /> View Prescriptions
              </Link>
            </li>
            <li className="nav-item">
              <Link to="test-reports" className="nav-link">
                <ClipboardList className="me-2" size={16} /> Test Reports
              </Link>
            </li>
            <li className="nav-item">
              <Link to="profile-management" className="nav-link">
                <User className="me-2" size={16} /> Profile Management
              </Link>
            </li>
            <li>
              <Link to="/appointment" className="nav-link">
                <User className="me-2" size={16} /> Make an Appointment
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-link text-danger">
                <LogOut className="me-2" size={16} /> Logout
              </Link>
            </li>
          </ul>
        </div>

        
        <div className="content p-4 flex-grow-1">
          <div className="main-content">
           
            <div className="top-section mb-4">
              <div className="d-flex align-items-center">
                <User className="me-3 text-primary" size={40} />
                <div>
                  <div className="fw-bold">{patient.name}</div>
                  <div className="text-muted">Age: {patient.age}</div>
                  <div className="text-secondary">
                    You have 2 appointments scheduled
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="card-grid mb-4">
              <div className="card">
                <div className="fw-bold">Appointments</div>
                <div className="fs-4">3</div>
              </div>
              <div className="card">
                <div className="fw-bold">Prescriptions</div>
                <div className="fs-4">12</div>
              </div>
              <div className="card">
                <div className="fw-bold">Reports</div>
                <div className="fs-4">8</div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="bottom-grid mt-4">
              {/* Appointment History */}
              <div className="chart-section small-card">
                <div className="section-title">Upcoming Appointments</div>
                <p>
                  • Neurologist – 12th Sept
                  <br />• Cardiologist – 20th Sept
                </p>
              </div>

              {/* Health Summary */}
              <div className="block-section flex-grow-1 ms-3">
                <div className="section-title">Health Summary</div>
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Blood Pressure</td>
                      <td>Normal</td>
                    </tr>
                    <tr>
                      <td>Cholesterol</td>
                      <td>Borderline</td>
                    </tr>
                    <tr>
                      <td>Diabetes</td>
                      <td>Controlled</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Route Content */}
          <Routes>
            <Route path="view-prescriptions" element={<ViewPrescriptions />} />
            <Route path="test-reports" element={<TestReports />} />
          </Routes>
        </div>

        {/* Notification Panel */}
        {showNotifications ? (
          <div className="notification-panel p-3">
            <h5>
              <Bell className="me-2" size={18} />
              Notifications
            </h5>
            <ul>
              <li>New test result uploaded.</li>
              <li>Appointment reminder: 12th Sept.</li>
              <li>Profile updated successfully.</li>
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
