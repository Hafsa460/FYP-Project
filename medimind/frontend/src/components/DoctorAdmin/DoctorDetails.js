import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./DoctorAdmin.css";

export default function DoctorDetails() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor-admin/doctor/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setStats(null);
    } catch (err) {
      console.error(err);
      setStats(null);
    }
  };

  if (!stats) return <div>Loading doctor stats...</div>;

  const genderData = [];
  if (stats.genderStats) {
    Object.keys(stats.genderStats).forEach((k) => {
      const v = stats.genderStats[k];
      if (v > 0) genderData.push({ name: k, value: v });
    });
  }

  const COLORS = ["#3b82f6", "#ec4899", "#9ca3af"];

  return (
    <div className="doctor-details">
      <h3>{stats.doctorInfo?.name || "Doctor details"}</h3>
      <div className="detail-grid">
        <div className="left">
          <div className="info-card">
            <div><strong>Department:</strong> {stats.doctorInfo?.department}</div>
            <div><strong>Designation:</strong> {stats.doctorInfo?.designation}</div>
            <div><strong>Working Hours:</strong> {stats.doctorInfo?.workingHours?.start} - {stats.doctorInfo?.workingHours?.end}</div>
            <div><strong>Total Appointments:</strong> {stats.totalAppointments}</div>
            <div><strong>Total Prescriptions:</strong> {stats.totalPrescriptions}</div>
            <div><strong>Total Patients Treated:</strong> {stats.totalPatients}</div>
          </div>

          <div className="recent-appts">
            <h4>Recent Appointments</h4>
            {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
              <ul>
                {stats.recentAppointments.map((a) => (
                  <li key={a._id}>
                    {a.patientId?.name || "Patient"} — {new Date(a.date).toLocaleDateString()} {a.time} ({a.status})
                  </li>
                ))}
              </ul>
            ) : (<div>No recent appointments</div>)}
          </div>
        </div>

        <div className="right">
          <div className="chart-card">
            <h4>Patient Gender Ratio</h4>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {genderData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (<div>No patient gender data</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
