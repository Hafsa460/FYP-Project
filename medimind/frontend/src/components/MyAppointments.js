import React, { useEffect, useState } from "react";
import { Calendar, Download, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const MyAppointments = ({
  patient = JSON.parse(localStorage.getItem("patient")),
}) => {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("patient");
    window.location.href = "/Login-option";
  };

  useEffect(() => {
    if (!patient || !patient._id) return;

    fetch(`http://localhost:5000/api/appointments/patient/${patient._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAppointments(data || []))
      .catch((err) => console.error(err));
  }, [patient, token]);

  return (
    <div>
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

        {/* Main Content */}
        <div className="p-4 flex-grow-1">
          <h4 className="mb-4">My Appointments</h4>

          {appointments.length === 0 ? (
            <div className="text-muted">No appointments found.</div>
          ) : (
            <div className="row g-3">
              {appointments.map((appt) => (
                <div key={appt._id} className="col-md-6">
                  <div className="card shadow-sm p-3 h-100">
                    <div className="d-flex justify-content-between">
                      <h6 className="fw-semibold">{appt.doctorId?.name}</h6>
                      <span
                        className={`badge ${
                          appt.status === "Completed"
                            ? "bg-success"
                            : appt.status === "Pending"
                            ? "bg-warning"
                            : "bg-secondary"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <p className="mb-1 text-muted">
                      <Calendar size={14} className="me-1" />
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>

                    <p className="mb-2 text-muted">
                      Department: {appt.doctorId?.department}
                    </p>

                    {/* PDF BUTTON */}
                    {appt.pdf && (
                      <a
                        href={`http://localhost:5000${appt.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm d-flex align-items-center w-fit"
                      >
                        <Download size={16} className="me-2" />
                        Open Appointment PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
