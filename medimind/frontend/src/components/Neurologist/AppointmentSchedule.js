import { useState, useEffect } from "react";
import "./AppointmentSchedule.css";

function AppointmentSchedule() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load doctor from localStorage
  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) setDoctor(JSON.parse(storedDoctor));
  }, []);

  // Fetch all appointments for this doctor
  useEffect(() => {
    if (!doctor?._id) return;

    const fetchAppointments = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("doctorToken");
        const res = await fetch(
          `http://localhost:5000/api/appointments/doctor/${doctor._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        setError("Could not load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctor]);

  // Update appointment status
  const updateStatus = async (id, newStatus) => {
    const currentAppt = appointments.find((a) => a._id.toString() === id.toString());
    const oldStatus = currentAppt?.status || "Pending";

    const confirmChange = window.confirm(
      `Are you sure you want to change the status to "${newStatus}"?`
    );
    if (!confirmChange) return;

    try {
      const token = localStorage.getItem("doctorToken");
      const res = await fetch(
        `http://localhost:5000/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      // Update the state to reflect backend
      setAppointments((prev) =>
        prev.map((a) =>
          a._id.toString() === data.appointment._id.toString()
            ? { ...a, status: data.appointment.status }
            : a
        )
      );

      alert("Status updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating status");

      // Revert UI if server fails
      setAppointments((prev) =>
        prev.map((a) =>
          a._id.toString() === id.toString() ? { ...a, status: oldStatus } : a
        )
      );
    }
  };

  // Filter upcoming appointments
  const upcomingAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    const today = new Date();
    apptDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return apptDate >= today;
  });

  // Filter today's appointments
  const today = new Date();
  const todaysAppointments = appointments.filter((appt) => {
    const d = new Date(appt.date);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  if (!doctor) return <p className="appt-message">Loading doctor...</p>;
  if (loading) return <p className="appt-message">Loading...</p>;
  if (error) return <p className="appt-message text-danger">{error}</p>;

  return (
    <div className="appt-container">
      <h3 className="appt-title mb-3">Appointment Schedule</h3>

      <div className="appt-summary mb-4">
        <strong>Total Appointments:</strong> {upcomingAppointments.length} <br />
        <strong>Today's Appointments:</strong> {todaysAppointments.length}
      </div>

      <h5 className="appt-section">Upcoming Appointments</h5>

      {upcomingAppointments.length > 0 ? (
        <ul className="appt-list">
          {upcomingAppointments.map((appt) => {
            const isFinal =
              appt.status === "Completed" || appt.status === "Canceled";

            return (
              <li key={appt._id} className="appt-item">
                <span className="appt-patient">
                  {appt.patientId?.name || "Patient"}
                </span>

                <span className="appt-date">
                  {new Date(appt.date).toLocaleDateString()} at {appt.time}
                </span>

                <div className="appt-status">
                  <strong>Status:</strong>{" "}
                  <select
                    value={appt.status || "Pending"}
                    onChange={(e) => updateStatus(appt._id, e.target.value)}
                    disabled={isFinal}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>

                  {isFinal && <span>🔒</span>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No upcoming appointments</p>
      )}
    </div>
  );
}

export default AppointmentSchedule;
