import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Users,
  FileText,
  ClipboardList,
  LogOut,
  LayoutGrid,
  Search,
  Bell,
  Settings,
  SunMoon,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
function AdminDashboard({ onLogout }) {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch patients from backend
  axios
    .get("http://localhost:5000/api/adminpatients")
    .then((res) => {
      console.log("Patients fetched:", res.data); // Debug
      setPatients(res.data);
      setFilteredPatients(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setError("Failed to load patients.");
      setLoading(false);
    });

  // Search filter
  useEffect(() => {
    const lowercased = search.toLowerCase();
    setFilteredPatients(
      patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(lowercased) ||
          p.email?.toLowerCase().includes(lowercased) ||
          p.mrNo?.toString().includes(lowercased)
      )
    );
  }, [search, patients]);

  // Table columns
  const columns = [
    { field: "_id", headerName: "ID", width: 200 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "age", headerName: "Age", width: 100 },
    { field: "mrNo", headerName: "MR No", width: 120 },
    {
      field: "isVerified",
      headerName: "Verified",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <span className="text-success fw-bold">✔ Yes</span>
        ) : (
          <span className="text-danger fw-bold">✘ No</span>
        ),
    },
  ];

  // Reusable widget component
  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="col-md-4">
      <div className="card shadow-sm p-3 h-100 d-flex flex-column justify-content-center">
        <Icon className="text-primary mb-2" size={24} />
        <p className="text-muted mb-1">{label}</p>
        <h4 className="fw-bold">{value}</h4>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <aside
          className="bg-white border-end shadow-sm p-3 d-flex flex-column justify-content-between"
          style={{ width: "250px" }}
        >
          <div>
            <h5 className="mb-4 d-flex align-items-center text-primary">
              <Users className="me-2" /> Admin
            </h5>
            <nav>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link
                    to="/admin-dashboard"
                    className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                  >
                    <LayoutGrid className="me-2" size={18} />
                    Dashboard
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <Link
              to="/"
              className="d-flex align-items-center p-2 rounded text-danger text-decoration-none"
            >
              <LogOut className="me-2" size={18} />
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 p-4">
          {/* Header */}
          <header className="bg-white p-3 rounded shadow-sm d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <LayoutGrid className="me-2 text-muted" size={20} />
              <span className="text-muted">Admin / Dashboard</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="position-relative me-3">
                <Search
                  className="position-absolute top-50 translate-middle-y ms-2 text-muted"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="form-control ps-5"
                  style={{ width: "220px" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <SunMoon className="me-3 text-muted" role="button" />
              <Settings className="me-3 text-muted" role="button" />
              <Bell className="me-3 text-muted" role="button" />
            </div>
          </header>

          {/* Dashboard Title */}
          <h2 className="h4 mb-4 d-flex justify-content-between align-items-center">
            Dashboard
            <div className="d-flex align-items-center text-muted small">
              Today <ChevronDown className="ms-1" size={14} />
            </div>
          </h2>

          {/* Summary Widgets */}
          <div className="row g-4 mb-4">
            <StatCard
              icon={Users}
              label="Total Patients"
              value={patients.length}
            />
            <StatCard
              icon={ClipboardList}
              label="Verified Patients"
              value={patients.filter((p) => p.isVerified).length}
            />
            <StatCard
              icon={FileText}
              label="Unverified Patients"
              value={patients.filter((p) => !p.isVerified).length}
            />
          </div>

          {/* Patients Table */}
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">Patient Records</h5>
            {loading ? (
              <p>Loading patients...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-muted">No patients found.</p>
            ) : (
              <div style={{ height: 500, width: "100%" }}>
                <DataGrid
                  rows={filteredPatients}
                  columns={columns}
                  getRowId={(row) => row._id}
                  pageSize={7}
                  rowsPerPageOptions={[7, 15, 30]}
                  onRowClick={(params) =>
                    navigate(`/patient/${params.row._id}`)
                  }
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;
