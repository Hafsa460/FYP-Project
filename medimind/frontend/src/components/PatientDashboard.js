import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./PatientDashboard.css";

function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const storedPatient = localStorage.getItem("patient");
      const token = localStorage.getItem("token");

      if (!storedPatient) {
        navigate("/login-patient");
        return;
      }

      const parsedPatient = JSON.parse(storedPatient);
      setPatient(parsedPatient);

      const patientId = parsedPatient._id;
      if (!patientId) return;

      try {
        // Fetch appointments
        const apptRes = await fetch(`http://localhost:5000/api/appointments/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!apptRes.ok) throw new Error("Failed to fetch appointments");
        const apptData = await apptRes.json();
        setAppointments(Array.isArray(apptData) ? apptData : []);

        // Fetch prescriptions
       const presRes = await fetch(`http://localhost:5000/api/patient-prescriptions/patient/${patientId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        if (!presRes.ok) throw new Error("Failed to fetch prescriptions");
        const presData = await presRes.json();
        setPrescriptions(Array.isArray(presData) ? presData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="p-4">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="p-4">No patient data found.</div>;
  }

  return (
    <div className="main-content">
            {/* Top Section */}
            <div className="top-section mb-4">
              <div className="d-flex align-items-center">
                <User className="me-3 text-primary" size={40} />
                <div>
                  <div className="fw-bold">{patient.name}</div>
                  <div className="text-muted">Age: {patient.age}</div>
                  <div className="text-secondary">
                    You have {appointments.length} appointments scheduled
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="card-grid mb-4">
              <div className="card">
                <div className="fw-bold">Appointments</div>
                <div className="fs-4">{appointments.length}</div>
              </div>
              <div className="card">
                <div className="fw-bold">Prescriptions</div>
                <div className="fs-4">{prescriptions.length}</div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="bottom-grid mt-4">
              <div className="chart-section small-card">
                <div className="section-title">Upcoming Appointments</div>
                {appointments.length > 0 ? (
                  <ul>
                    {appointments.map((appt) => (
                      <li key={appt._id}>
                        {appt.doctorId?.name} – {appt.doctorId?.department} –{" "}
                        {new Date(appt.date).toLocaleDateString()} at {appt.time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming appointments</p>
                )}
              </div>
            </div>
          </div>
    );
  }
  
  export default PatientDashboard;
