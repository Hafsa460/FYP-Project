import React, { useEffect, useState } from "react";
import { Calendar, Download } from "lucide-react";

const MyAppointments = ({ patient }) => {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!patient) return;

    const patientId = patient._id || patient.id || patient.mrNo;

    fetch(`http://localhost:5000/api/appointments/patient/${patientId}`, {
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
      <h4 className="mb-4">My Appointments</h4>

      {appointments.length === 0 ? (
        <div className="text-muted">No appointments found.</div>
      ) : (
        <div className="row g-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="col-md-6">
              <div className="card shadow-sm p-3 h-100">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-semibold">
                    {appt.doctorId?.name}
                  </h6>
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
  );
};

export default MyAppointments;
