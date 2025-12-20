import React, { useEffect, useState } from "react";
import { Users, FileText, ClipboardList, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./PatientAdmin.css";

function PatientAdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    verifiedPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      // Fetch patients
      const patientsRes = await fetch("http://localhost:5000/api/adminpatient", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patientsData = await patientsRes.json();

      // Calculate stats
      const totalPatients = patientsData.length || 0;
      const verifiedPatients = patientsData.filter(p => p.isVerified).length || 0;

      setStats({
        totalPatients,
        verifiedPatients,
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="admin-dashboard-content">
      {/* Header */}
      <div className="admin-header">
        <h1>Patient Administration Dashboard</h1>
        <div className="header-controls">
          {/* Add any header controls if needed */}
        </div>
      </div>

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
            <p className="card-value">{stats.totalPatients - stats.verifiedPatients}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bottom-grid">
        <div className="chart-section">
          <h4 className="section-title">Patient Verification Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Verified', value: stats.verifiedPatients },
                  { name: 'Unverified', value: stats.totalPatients - stats.verifiedPatients }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
      </div>
    </div>
  );
}

export default PatientAdminDashboard;