import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  User,
  Users,
  SunMoon,
  ChevronDown,
  Star,
} from "lucide-react";
import Navbar from "./Navbar";

function PatientDashboard({ onLogout }) {
  const [showNotificationsSidebar, setShowNotificationsSidebar] =
    useState(false);
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

  const toggleNotificationsSidebar = () => {
    setShowNotificationsSidebar(!showNotificationsSidebar);
  };

  if (!patient) {
    return <div className="p-4">Loading patient data...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="d-flex min-vh-100 bg-light">
        <aside
          className="bg-white border-end shadow-sm p-3 d-flex flex-column justify-content-between"
          style={{ width: "250px" }}
        >
          <div>
            <div>
              <div className="d-flex align-items-center mb-4">
                <User className="me-2 text-primary" size={32} />
                <Link
                  to="/PatientDashboard"
                  className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                >
                  {patient.name}
                </Link>
              </div>
            </div>

            <h2 className="h6 text-muted mb-3">Dashboard</h2>
            <nav>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link
                    to="/view-prescriptions"
                    className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                  >
                    <FileText className="me-2" size={18} />
                    View Prescriptions
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/testreport"
                    className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                  >
                    <ClipboardList className="me-2" size={18} />
                    Test Reports
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/profile-management"
                    className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                  >
                    <User className="me-2" size={18} />
                    Profile Management
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <Link
              to="/"
              className="d-flex align-items-center p-2 rounded text-danger text-decoration-none"
            >
              <LogOut className="me-2" size={18} />
              Logout
            </Link>
          </div>
        </aside>

        <main className="flex-grow-1 p-4">
          <header className="bg-white p-3 rounded shadow-sm d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <LayoutGrid className="me-2 text-muted" size={20} />
              <Star className="me-2 text-muted" size={20} />
              <span className="text-muted">Dashboards / Default</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="position-relative me-3">
                <Search
                  className="position-absolute top-50 translate-middle-y ms-2 text-muted"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="form-control ps-5"
                  style={{ width: "200px" }}
                />
              </div>
              <SunMoon className="me-3 text-muted" role="button" />
              <Settings className="me-3 text-muted" role="button" />
              <LayoutGrid className="me-3 text-muted" role="button" />
              <div
                className="d-flex align-items-center border-start ps-3 text-muted"
                role="button"
                onClick={toggleNotificationsSidebar}
              >
                <Bell className="me-1" size={20} />
                Notifications
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <h2 className="h4 mb-4 d-flex justify-content-between align-items-center">
            Dashboard
            <div className="d-flex align-items-center text-muted small">
              Today <ChevronDown className="ms-1" size={14} />
            </div>
          </h2>

          <div className="row g-4">
            {/* Patient Info */}
            <div className="col-md-8">
              <div className="card shadow-sm h-100 d-flex flex-row align-items-center p-3">
                <div className="bg-info bg-opacity-25 p-3 rounded me-3">
                  <Users className="text-primary" size={48} />
                </div>
                <div>
                  <h3 className="h5">{patient.name}</h3>
                  <p className="mb-1 text-muted">
                    Age: <span className="fw-semibold">{patient.age}</span>
                  </p>
                  <p className="mb-1 text-muted">
                    Gender:{" "}
                    <span className="fw-semibold">{patient.gender}</span>
                  </p>
                  <p className="mb-0 text-muted">
                    Blood Group:{" "}
                    <span className="fw-semibold">{patient.bloodGroup}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder for widget */}
            <div className="col-md-4"></div>

            {/* Appointment */}
            <div className="col-md-4">
              <div
                onClick={() => navigate("/manage-appointment")}
                className="card shadow-sm p-3 cursor-pointer h-100"
                role="button"
              >
                <Users className="text-primary mb-2" size={24} />
                <p className="text-muted mb-1">Appointment today</p>
                <h4 className="fw-bold">1</h4>
              </div>
            </div>

            {/* Test History */}
            <div className="col-md-4">
              <div
                onClick={() => navigate("/test-history")}
                className="card shadow-sm p-3 cursor-pointer h-100"
                role="button"
              >
                <FileText className="text-primary mb-2" size={24} />
                <p className="text-muted mb-1">Total Tests Done</p>
                <h4 className="fw-bold">2,318</h4>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="col-md-4">
              <div
                onClick={() => navigate("/view-prescriptions")}
                className="card shadow-sm p-3 cursor-pointer h-100"
                role="button"
              >
                <ClipboardList className="text-primary mb-2" size={24} />
                <p className="text-muted mb-1">Pending Tests</p>
                <h4 className="fw-bold">10</h4>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default PatientDashboard;
