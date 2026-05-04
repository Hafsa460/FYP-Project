import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API = "http://localhost:5000/api";

const toast = (msg) => {
  const el = document.createElement("div");
  el.className = "super-toast";
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
};

export default function SuperAdmin({ activeTab }) {
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState(null);
  const [admins, setAdmins] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "patientAdmin",
    gender: "female",
  });
  const [adminTab, setAdminTab] = useState("patientAdmin");

  const cacheRef = useRef({
    overview: null,
    admins: null,
    doctors: null,
    patients: null,
    departments: null,
    appointments: null,
  });

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) toast("No auth token found. Please login again.");

    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }, []);

  const fetchJSON = useCallback(
    async (url, options = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...getHeaders(),
          ...(options.headers || {}),
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Request failed");
      }

      return data;
    },
    [getHeaders]
  );

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [ov, adm, doc, pat, dep, app] = await Promise.all([
        cacheRef.current.overview ||
          fetchJSON(`${API}/doctor-admin/overview`),

        cacheRef.current.admins || fetchJSON(`${API}/superadmin`),

        cacheRef.current.doctors ||
          fetchJSON(`${API}/doctor-admin/doctors`).catch(() => []),

        cacheRef.current.patients ||
          fetchJSON(`${API}/adminpatient`).catch(() => []),

        cacheRef.current.departments ||
          fetchJSON(`${API}/departments`).catch(() => []),

        cacheRef.current.appointments ||
          fetchJSON(`${API}/appointments`).catch(() => []),
      ]);

      cacheRef.current.overview = ov;
      cacheRef.current.admins = adm;
      cacheRef.current.doctors = doc;
      cacheRef.current.patients = pat;
      cacheRef.current.departments = dep;
      cacheRef.current.appointments = app;

      setOverview(ov);
      setAdmins(safeArray(adm));
      setDoctors(safeArray(doc));
      setPatients(safeArray(pat));
      setDepartments(safeArray(dep));
      setAppointments(safeArray(app));
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchJSON]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setNewAdmin((prev) => ({ ...prev, role: adminTab }));
  }, [adminTab]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.role) {
      toast("All fields are required");
      return;
    }

    try {
      await fetchJSON(`${API}/superadmin`, {
        method: "POST",
        body: JSON.stringify(newAdmin),
      });

      toast("Admin created");

      setNewAdmin({
        name: "",
        email: "",
        password: "",
        role: newAdmin.role,
        gender: newAdmin.gender,
      });

      cacheRef.current.admins = null;
      loadData();
    } catch (err) {
      toast(err.message);
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Deactivate admin?")) return;

    try {
      await fetchJSON(`${API}/superadmin/${id}`, {
        method: "DELETE",
      });

      toast("Admin deactivated");

      cacheRef.current.admins = null;
      await loadData();
    } catch (err) {
      toast(err.message);
    }
  };

  const getAdminsByRole = (role) =>
    safeArray(admins).filter((a) => a.role === role);

  const appointmentChartData = Object.values(
    safeArray(appointments).reduce((acc, a) => {
      const month = new Date(a.date || a.createdAt || Date.now())
        .toLocaleString("default", { month: "short" });

      acc[month] = acc[month] || { month, count: 0 };
      acc[month].count += 1;
      return acc;
    }, {})
  );

  // =========================
  // MODERN PIE CHART DATA
  // =========================
  const doctorWorkload = safeArray(doctors).map((d) => {
    const value = safeArray(appointments).filter(
      (a) =>
        String(a.doctorId) === String(d._id) ||
        a.doctor === d.name
    ).length;

    return {
      name: d.name || "Unknown",
      value,
    };
  });

  const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#a855f7"];

  const renderAdminsTable = (list) => (
    <table className="super-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>ID</th>
          <th>Email</th>
          <th>Role</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {safeArray(list).map((a) => (
          <tr key={a._id}>
            <td>{a.name}</td>
            <td>{a.id}</td>
            <td>{a.email}</td>
            <td>{a.role}</td>
            <td>
              <button
                className="super-btn delete"
                onClick={() => deleteAdmin(a._id)}
              >
                Deactivate
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDashboard = () => (
    <>
      <div className="super-header">Welcome Super Admin</div>

      <div className="super-grid">
        <div className="super-card">
          <div className="super-card-title">Admins</div>
          <div className="super-card-value">{safeArray(admins).length}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Doctors</div>
          <div className="super-card-value">{safeArray(doctors).length}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Patients</div>
          <div className="super-card-value">{safeArray(patients).length}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Departments</div>
          <div className="super-card-value">{safeArray(departments).length}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Appointments</div>
          <div className="super-card-value">{safeArray(appointments).length}</div>
        </div>
      </div>

      <div style={{ width: "100%", height: 260, marginTop: 20 }}>
        <ResponsiveContainer>
          <LineChart data={appointmentChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#6366f1" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* =========================
          MODERN PIE CHART
      ========================= */}
      <div style={{ width: "100%", height: 320, marginTop: 30 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={doctorWorkload}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={60}
              paddingAngle={4}
              label
            >
              {doctorWorkload.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const renderForm = () => (
    <form onSubmit={handleCreateAdmin} className="super-form">
      <div className="super-form-row">
        <input
          placeholder="Full Name"
          value={newAdmin.name}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={newAdmin.email}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, email: e.target.value })
          }
        />
      </div>

      <div className="super-form-row">
        <input
          type="password"
          placeholder="Password"
          value={newAdmin.password}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, password: e.target.value })
          }
        />

        <select
          value={newAdmin.role}
          onChange={(e) => {
            const role = e.target.value;
            setAdminTab(role);
            setNewAdmin({ ...newAdmin, role });
          }}
        >
          <option value="patientAdmin">Patient Admin</option>
          <option value="doctorAdmin">Doctor Admin</option>
          <option value="departmentAdmin">Department Admin</option>
        </select>

        <select
          value={newAdmin.gender}
          onChange={(e) =>
            setNewAdmin({ ...newAdmin, gender: e.target.value })
          }
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button type="submit" className="super-btn add">
          + Add {newAdmin.role}
        </button>
      </div>
    </form>
  );

  const renderAdminManagement = () => {
    const tabs = [
      { key: "patientAdmin", label: "Patient Admins" },
      { key: "doctorAdmin", label: "Doctor Admins" },
      { key: "departmentAdmin", label: "Department Admins" },
    ];

    return (
      <>
        <div className="super-header">Admin Management</div>

        <div className="admin-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-tab ${adminTab === tab.key ? "active" : ""}`}
              onClick={() => setAdminTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          <div className="admin-section-title">{tabs.find((tab) => tab.key === adminTab)?.label}</div>
          {renderForm()}
          {renderAdminsTable(getAdminsByRole(adminTab))}
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="super-header">Loading...</div>;

    switch (activeTab) {
      case "dashboard":
        return renderDashboard();

      case "superAdmins":
        return (
          <>
            <div className="super-header">Super Admins</div>
            {renderAdminsTable(getAdminsByRole("superAdmin"))}
          </>
        );

      case "adminManagement":
        return renderAdminManagement();

      default:
        return <div className="super-header">Select section</div>;
    }
  };

  return <div className="super-content">{renderContent()}</div>;
}