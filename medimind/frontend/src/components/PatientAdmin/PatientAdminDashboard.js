import React, { useEffect, useState } from "react";
import { Users, FileText, ClipboardList, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./PatientAdmin.css";

function PatientAdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    verifiedPatients: 0,
    unverifiedPatients: 0,
    malePatients: 0,
    femalePatients: 0,
    newPatientsLast30Days: 0,
    recentPatients: [],
  });
  const [loading, setLoading] = useState(true);

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  useEffect(() => {
    fetchStats();
  }, []);

  const getToken = () => {
    const rawToken =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    return rawToken && rawToken !== "undefined" && rawToken !== "null"
      ? rawToken
      : null;
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Admin auth token is missing");

      const patientsRes = await fetch(
        "http://localhost:5000/api/adminpatient",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!patientsRes.ok) {
        const errorBody = await patientsRes.json().catch(() => ({}));
        throw new Error(
          errorBody.error || errorBody.message || "Failed to fetch patients",
        );
      }

      const patientsData = safeArray(await patientsRes.json());
      const totalPatients = patientsData.length;
      const verifiedPatients = patientsData.filter((p) => p.isVerified).length;
      const unverifiedPatients = totalPatients - verifiedPatients;
      const malePatients = patientsData.filter(
        (p) => (p.gender || "").toString().toLowerCase() === "male",
      ).length;
      const femalePatients = patientsData.filter(
        (p) => (p.gender || "").toString().toLowerCase() === "female",
      ).length;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const newPatientsLast30Days = patientsData.filter((p) => {
        const createdAt = new Date(p.createdAt || p.updatedAt || null);
        return (
          createdAt instanceof Date && !isNaN(createdAt) && createdAt >= cutoff
        );
      }).length;
      const recentPatients = patientsData
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt || null) -
            new Date(a.createdAt || a.updatedAt || null),
        )
        .slice(0, 5);

      setStats({
        totalPatients,
        verifiedPatients,
        unverifiedPatients,
        malePatients,
        femalePatients,
        newPatientsLast30Days,
        recentPatients,
      });
    } catch (err) {
      console.error("Failed to fetch stats", err);
      setStats((prev) => ({
        ...prev,
      }));
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="admin-dashboard-content">
      {/* Header */}
      <div className="admin-header">
        <h1>Patient Administration Dashboard</h1>
        <div className="header-controls">
          {/* Add any header controls if needed */}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading patient statistics...</div>
      ) : (
        <>
          {/* Summary Widgets */}
          <div className="overview-cards">
            <div className="card">
              <Users className="stat-icon" />
              <div>
                <h3 className="card-title">Total Patients</h3>
                <p className="card-value">{stats.totalPatients}</p>
              </div>
            </div>
            <div className="card">
              <CheckCircle className="stat-icon" />
              <div>
                <h3 className="card-title">Verified Patients</h3>
                <p className="card-value">{stats.verifiedPatients}</p>
              </div>
            </div>
            <div className="card">
              <FileText className="stat-icon" />
              <div>
                <h3 className="card-title">Unverified Patients</h3>
                <p className="card-value">{stats.unverifiedPatients}</p>
              </div>
            </div>
            <div className="card">
              <ClipboardList className="stat-icon" />
              <div>
                <h3 className="card-title">New Last 30 Days</h3>
                <p className="card-value">{stats.newPatientsLast30Days}</p>
              </div>
            </div>
            <div className="card">
              <Users className="stat-icon" />
              <div>
                <h3 className="card-title">Male Patients</h3>
                <p className="card-value">{stats.malePatients}</p>
              </div>
            </div>
            <div className="card">
              <Users className="stat-icon" />
              <div>
                <h3 className="card-title">Female Patients</h3>
                <p className="card-value">{stats.femalePatients}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bottom-grid">
            <div className="chart-section">
              <h4 className="section-title">Verification Status</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Verified", value: stats.verifiedPatients },
                      { name: "Unverified", value: stats.unverifiedPatients },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-section">
              <h4 className="section-title">Gender Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Male", value: stats.malePatients },
                      { name: "Female", value: stats.femalePatients },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="recent-section">
            <h4 className="section-title">Recent Patients</h4>
            <div className="recent-list">
              {stats.recentPatients.length > 0 ? (
                stats.recentPatients.map((patient) => (
                  <div
                    className="recent-item"
                    key={
                      patient._id ||
                      patient.id ||
                      `${patient.email}-${patient.phone}`
                    }
                  >
                    <div>
                      <strong>
                        {patient.name || patient.fullName || "Unnamed Patient"}
                      </strong>
                      <div>{patient.email || "No email available"}</div>
                    </div>
                    <div>
                      {new Date(
                        patient.createdAt || patient.updatedAt || Date.now(),
                      ).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  No recent patients to display.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientAdminDashboard;
