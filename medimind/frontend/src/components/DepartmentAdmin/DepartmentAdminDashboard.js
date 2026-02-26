import React, { useEffect, useState } from "react";
import { Users, ClipboardList } from "lucide-react";

export default function DepartmentAdminDashboard() {
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/departments");
        const data = await res.json();
        setStats({ total: Array.isArray(data) ? data.length : 0 });
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h1>Department Administration</h1>
      </div>

      <div className="overview-cards">
        <div className="card">
          <Users className="stat-icon" />
          <div>
            <h3 className="card-title">Total Departments</h3>
            <p className="card-value">{stats.total}</p>
          </div>
        </div>
        <div className="card">
          <ClipboardList className="stat-icon" />
          <div>
            <h3 className="card-title">Actions</h3>
            <p className="card-value">Create / Edit / Delete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
