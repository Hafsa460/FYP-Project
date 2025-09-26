import { useState, useEffect } from "react";
import "./AppointmentSchedule.css";

function AppointmentSchedule() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
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

    fetchAppointments();
  }, [doctor]);
  const upcomingAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    const today = new Date();

    apptDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return apptDate >= today;
  });

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
        <strong>Total Appointments:</strong> {upcomingAppointments.length}{" "}
        <br />
        <strong>Today’s Appointments:</strong> {todaysAppointments.length}
      </div>

      <h5 className="appt-section">All Appointments</h5>
      <h5 className="appt-section">Upcoming Appointments</h5>
      {upcomingAppointments.length > 0 ? (
        <ul className="appt-list">
          {upcomingAppointments.map((appt) => (
            <li key={appt._id} className="appt-item">
              <span className="appt-patient">
                {appt.patientId?.name || "Patient"}
              </span>

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
