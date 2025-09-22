import { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import "./NeuroDashboard.css";
import femaleProfile from "../../images/female.png";
import VerifyReports from "./VerifyReports";
import PrescriptionHistory from "./PrescriptionHistory";
import ProfileManagement from "./ProfileManagement";
import Logout from "./Logout";
import Navbar from "../Navbar";

function NeuroDashboard() {
  const [showNotifications, setShowNotifications] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [nearestAppointments, setNearestAppointments] = useState([]);
  const navigate = useNavigate();

  // ✅ Load doctor from localStorage FIRST
  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      const parsed = JSON.parse(storedDoctor);
      setDoctor(parsed);
    } else {
      navigate("/"); // redirect if not logged in
    }
  }, [navigate]);

  // ✅ Fetch doctor’s appointments when doctor is loaded
  useEffect(() => {
    if (!doctor?._id) return; // wait until _id is ready

    const fetchAppointments = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/appointments/doctor/${doctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching doctor appointments:", err);
      }
    };

    fetchAppointments();
  }, [doctor]);

  // ✅ Fetch nearest 5 appointments for this doctor
  useEffect(() => {
    if (!doctor?._id) return;

    const fetchNearestAppointments = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/appointments/doctor/${doctor._id}/nearest5`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setNearestAppointments(data);
        } else {
          setNearestAppointments([]);
        }
      } catch (err) {
        console.error("Error fetching nearest doctor appointments:", err);
      }
    };

    fetchNearestAppointments();
  }, [doctor]);

  if (!doctor) {
    return <div className="p-4">Loading doctor data...</div>;
  }

  // ✅ Calculate today’s appointments from doctor’s full appointments
  // ✅ Calculate today’s appointments from doctor’s full appointments
  const todaysAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date); // convert MongoDB date
    const today = new Date();

    return (
      apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate()
    );
  });

  // ✅ Count unique patients for stats
  const uniquePatients = new Set(appointments.map((a) => a.patientId?._id))
    .size;

  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        {/* Sidebar */}
        <div className="sidebar p-3">
          <div className="doctor-profile d-flex align-items-center mb-4">
            <img
              src={femaleProfile}
              alt="Doctor"
              className="profile-icon me-3"
            />
            <div className="doctor-name fw-semibold">{doctor.name}</div>
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
              <Link to="/" className="nav-link text-danger">
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
                  <div className="fw-bold">{doctor.name}</div>
                  <div className="text-muted">{doctor.department}</div>
                  <div className="text-secondary">
                    You have {todaysAppointments.length} appointments today
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="card-grid">
              <div className="card">
                <div className="fw-bold">Total Appointments</div>
                <div className="fs-4">{appointments.length}</div>
              </div>
              <div className="card">
                <div className="fw-bold">Today’s Appointments</div>
                <div className="fs-4">{todaysAppointments.length}</div>
              </div>
            </div>

            <div className="bottom-grid mt-4">
              {/* All Appointments */}
              <div className="chart-section small-card">
                <div className="section-title">All Appointments</div>
                {appointments.length > 0 ? (
                  <ul>
                    {appointments.map((appt, idx) => (
                      <li key={appt._id}>
                        - {appt.patientId?.name || "Patient"} with{" "}
                        {appt.doctorId?.name} ({appt.doctorId?.department}) on{" "}
                        {new Date(appt.date).toLocaleDateString()} at{" "}
                        {appt.time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No appointments found</p>
                )}
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
                      <td>Best Cardiologist</td>
                      <td>2021</td>
                    </tr>
                    <tr>
                      <td>Top Neuro Specialist</td>
                      <td>2022</td>
                    </tr>
                    <tr>
                      <td>Medical Excellence Award</td>
                      <td>2023</td>
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
            <Route path="/" element={<Logout />} />
          </Routes>
        </div>

        {/* Notification Panel */}
        {showNotifications ? (
          <div className="notification-panel p-3">
            <h5>Notifications</h5>

            {appointments.length > 0 ? (
              <ul>
                {appointments.map((appt, idx) => (
                  <li key={appt._id}>
                    - {appt.patientId?.name || "Patient"} with{" "}
                    {appt.doctorId?.name} ({appt.doctorId?.department}) on{" "}
                    {new Date(appt.date).toLocaleDateString()} at {appt.time}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No appointments found</p>
            )}

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
