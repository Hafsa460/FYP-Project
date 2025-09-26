import { useState, useEffect } from "react";
import "./AppointmentSchedule.css";

function AppointmentSchedule() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [nearestAppointments, setNearestAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
    }
  }, []);

  useEffect(() => {
    if (!doctor?._id) return;

    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:5000/api/appointments/doctor/${doctor._id}`
        );
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setError("Could not load appointments.");
      } finally {
        setLoading(false);
      }
    };

    const fetchNearestAppointments = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/appointments/doctor/${doctor._id}/nearest5`
        );
        if (!res.ok) throw new Error("Failed to fetch nearest appointments");
        const data = await res.json();
        setNearestAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        // Optionally handle error
      }
    };

    fetchAppointments();
    fetchNearestAppointments();
  }, [doctor]);

  if (!doctor) return <p className="appt-message">Loading doctor data...</p>;
  if (loading) return <p className="appt-message">Loading appointments...</p>;
  if (error) return <p className="appt-message text-danger">{error}</p>;

  // Today's appointments
  const todaysAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    const today = new Date();
    return (
      apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate()
    );
  });

  return (
    <div className="appt-container">
      <h3 className="appt-title mb-3">Appointment Schedule</h3>

      <div className="appt-summary mb-4">
        <strong>Total Appointments:</strong> {appointments.length} <br />
        <strong>Today’s Appointments:</strong> {todaysAppointments.length}
      </div>

      <h5 className="appt-section">All Appointments</h5>
      {appointments.length > 0 ? (
        <ul className="appt-list">
          {appointments.map((appt) => (
            <li key={appt._id} className="appt-item">
              <span className="appt-patient">{appt.patientId?.name || "Patient"}</span>
              <span className="appt-date">
                {new Date(appt.date).toLocaleDateString()} at {appt.time}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="appt-message">No appointments found</p>
      )}

      <h5 className="appt-section mt-4">Nearest 5 Appointments</h5>
      {nearestAppointments.length > 0 ? (
        <ul className="appt-list">
          {nearestAppointments.map((appt) => (
            <li key={appt._id} className="appt-item">
              <span className="appt-patient">{appt.patientId?.name || "Patient"}</span>
              <span className="appt-date">
                {new Date(appt.date).toLocaleDateString()} at {appt.time}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="appt-message">No upcoming appointments</p>
      )}
    </div>
  );
}

export default AppointmentSchedule;