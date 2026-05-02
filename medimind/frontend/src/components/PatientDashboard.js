import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./PatientDashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
        const apptRes = await fetch(
          `http://localhost:5000/api/appointments/patient/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!apptRes.ok) throw new Error("Failed to fetch appointments");
        const apptData = await apptRes.json();
        setAppointments(Array.isArray(apptData) ? apptData : []);

        // Fetch prescriptions
        const presRes = await fetch(
          `http://localhost:5000/api/patient-prescriptions/patient/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

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
      {/* TOP CARD (like doctor dashboard) */}
      <div className="doctor-card d-flex align-items-center justify-content-between mb-4 p-3 shadow-sm rounded">
  <div className="d-flex align-items-center">
    <User size={60} className="me-3 text-primary" />

    <div>
      <div className="fw-bold fs-5 mb-2">{patient.name}</div>
      <div className="mb-1">
        <strong>Age:</strong> {patient.age}
      </div>
      <div className="mb-1">
        <strong>Upcoming Appointments:</strong>{" "}
        {appointments.filter(a => a.status === "Pending").length}
      </div>
    </div>
  </div>
</div>

      {/* CARDS GRID */}
      <div className="card-grid mb-4">
        <div className="card">
          <div className="fw-bold">Total Appointments</div>
          <div className="fs-4">{appointments.length}</div>
        </div>

        <div className="card">
          <div className="fw-bold">Pending Appointments</div>
          <div className="fs-4 text-warning">
            {appointments.filter((a) => a.status === "Pending").length}
          </div>
        </div>

        <div className="card">
          <div className="fw-bold">Completed Appointments</div>
          <div className="fs-4 text-success">
            {appointments.filter((a) => a.status === "Completed").length}
          </div>
        </div>

        <div className="card">
          <div className="fw-bold">Prescriptions</div>
          <div className="fs-4 text-primary">{prescriptions.length}</div>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="bottom-grid">
        {/* PIE CHART */}
        <div className="chart-section">
          <div className="section-title">Appointment Status</div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Pending",
                    value: appointments.filter((a) => a.status === "Pending")
                      .length,
                  },
                  {
                    name: "Completed",
                    value: appointments.filter((a) => a.status === "Completed")
                      .length,
                  },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
              >
                <Cell fill="#f59e0b" />
                <Cell fill="#10b981" />
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* QUICK INSIGHTS */}
        <div className="chart-section">
          <div className="section-title">Quick Insights</div>

          <div className="d-flex flex-column gap-3 mt-3">
            <div>📋 {appointments.length} total appointments</div>

            <div>
              ⏳ {appointments.filter((a) => a.status === "Pending").length}{" "}
              pending
            </div>

            <div>
              ✅ {appointments.filter((a) => a.status === "Completed").length}{" "}
              completed
            </div>

            <div>💊 {prescriptions.length} prescriptions received</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
