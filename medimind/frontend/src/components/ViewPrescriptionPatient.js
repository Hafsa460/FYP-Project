import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, LogOut, User } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientDashboard.css";

function ViewPrescriptionPatient() {
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (!storedPatient) {
      navigate("/");
      return;
    }

    try {
      const parsed = JSON.parse(storedPatient);
      setPatient(parsed);

      const patientId = parsed._id || parsed.id || parsed.mrNo;
      if (!patientId) return;

      fetch(`http://localhost:5000/api/prescriptions/patient/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json()) // ✅ parse JSON
        .then((data) => {
          if (Array.isArray(data)) {
            setPrescriptions(data);
          } else if (data.success) {
            setPrescriptions(data.prescriptions || []);
          } else {
            setError(data.message || "No prescriptions found");
          }
        })
        .catch((err) => {
          console.error("❌ Error fetching prescriptions:", err);
          setError("Failed to load prescriptions");
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("Invalid patient data in localStorage", err);
      setError("Invalid patient data");
      setLoading(false);
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
              <Link to="/view-prescriptionspatient" className="nav-link active">
                <FileText className="me-2" size={16} /> View Prescriptions
              </Link>
            </li>
            <li className="nav-item">
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

        {/* Main Content */}
        <div className="content p-4 flex-grow-1">
          <h3>My Prescriptions</h3>

          {loading && <p>Loading prescriptions...</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && prescriptions.length > 0 ? (
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td>{p.doctor?.name || "Unknown"}</td>
                    <td>
                      <Link
                        to={`/prescription/${p._id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Prescription
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && <p>No prescriptions found</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewPrescriptionPatient;
