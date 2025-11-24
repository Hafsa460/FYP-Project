// src/components/DoctorAdmin/DoctorAdminDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./DoctorAdmin.css";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6"];

const DoctorAdminDashboard = () => {
  const [overview, setOverview] = useState({});
  const [admin, setAdmin] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchOverview = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor-admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) setOverview(res.data);
    } catch (err) {
      console.error("Error fetching overview", err);
    }
  };

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor-admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) setAdmin(res.data.admin);
    } catch (err) {
      console.error("Error fetching admin info", err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchAdmin();
  }, []);

  const deptData = (overview.doctorsByDept || []).map((d) => ({
    name: d.department,
    value: d.count,
  }));

  return (
    <div className="admin-dashboard-content">
      <h2>Doctor Admin Dashboard</h2>

      {/* ----------- Admin Card ----------- */}
      {admin && (
        <div className="card admin-card mb-3 d-flex align-items-center p-3 shadow-sm rounded">
          <img
            src={admin.gender === "male" ? maleProfile : femaleProfile}
            alt="Admin"
            className="profile-icon me-3"
          />
          <div>
            <div className="fw-bold fs-5">{admin.name}</div>
            <div className="text-muted">ID: {admin.id}</div>
            <div className="text-muted">Role: {admin.role}</div>
          </div>
        </div>
      )}

      {/* ----------- Overview Cards ----------- */}
      <div className="overview-cards mb-3">
        <div className="card">
          <div className="card-title">Total Doctors</div>
          <div className="card-value">{overview.totalDoctors ?? 0}</div>
        </div>

        <div className="card">
          <div className="card-title">Total Appointments</div>
          <div className="card-value">{overview.totalAppointments ?? 0}</div>
          <div className="card-sub">
            Pending: {overview.apptStatus?.pending ?? 0} / Completed:{" "}
            {overview.apptStatus?.completed ?? 0}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Prescriptions</div>
          <div className="card-value">{overview.totalPrescriptions ?? 0}</div>
        </div>
      </div>

      {/* ----------- Chart Only ----------- */}
      <div style={{ width: "100%", marginTop: 20 }}>
        <h4>Doctors by Department</h4>
        {deptData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deptData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {deptData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div>No department data</div>
        )}
      </div>
    </div>
  );
};

export default DoctorAdminDashboard;
