import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ResponsiveContainer,
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
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);

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
    prescriptions: null,
    reports: null,
  });

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  const getArray = (data, ...keys) => {
    if (Array.isArray(data)) return data;
    for (const key of keys) {
      if (Array.isArray(data?.[key])) return data[key];
    }
    return [];
  };

  const getHeaders = useCallback(() => {
    // Prefer adminToken (set by admin login), fall back to generic token
    const rawToken =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token =
      rawToken && rawToken !== "undefined" && rawToken !== "null"
        ? rawToken
        : null;

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
    [getHeaders],
  );

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [ov, adm, doc, pat, dep, app, pres, rep] = await Promise.all([
        cacheRef.current.overview || fetchJSON(`${API}/doctor-admin/overview`),

        cacheRef.current.admins || fetchJSON(`${API}/superadmin`),

        cacheRef.current.doctors ||
          fetchJSON(`${API}/doctor-admin/doctors`).catch(() => []),

        cacheRef.current.patients ||
          fetchJSON(`${API}/adminpatient`).catch(() => []),

        cacheRef.current.departments ||
          fetchJSON(`${API}/departments`).catch(() => []),

        cacheRef.current.appointments ||
          fetchJSON(`${API}/appointments`).catch(() => []),

        cacheRef.current.prescriptions ||
          fetchJSON(`${API}/prescriptions`).catch(() => []),

        cacheRef.current.reports ||
          fetchJSON(`${API}/reports/all`).catch(() => []),
      ]);

      cacheRef.current.overview = ov;
      cacheRef.current.admins = adm;
      cacheRef.current.doctors = doc;
      cacheRef.current.patients = pat;
      cacheRef.current.departments = dep;
      cacheRef.current.appointments = app;
      cacheRef.current.prescriptions = pres;
      cacheRef.current.reports = rep;

      setOverview(ov);
      setAdmins(getArray(adm, "admins", "data", "items"));
      setDoctors(getArray(doc, "doctors", "data", "items"));
      setPatients(getArray(pat, "patients", "data", "items"));
      setDepartments(getArray(dep, "departments", "data", "items"));
      setAppointments(getArray(app, "appointments", "data", "items"));
      setPrescriptions(getArray(pres, "prescriptions", "data", "items"));
      setReports(getArray(rep, "reports", "data", "items"));
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

    if (
      !newAdmin.name ||
      !newAdmin.email ||
      !newAdmin.password ||
      !newAdmin.role
    ) {
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

  const COLORS = [
    "#6366f1",
    "#22c55e",
    "#f97316",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
  ];

  const normalizeStatus = (value) => (value || "").toString().toLowerCase();

  const completedAppointmentCount = safeArray(appointments).filter((a) => {
    const status = normalizeStatus(a.status);
    return status === "approved" || status === "completed";
  }).length;

  const pendingAppointmentCount = safeArray(appointments).filter(
    (a) => normalizeStatus(a.status) === "pending",
  ).length;

  const rejectedAppointmentCount = safeArray(appointments).filter(
    (a) => normalizeStatus(a.status) === "rejected",
  ).length;

  const activeDoctorCount = safeArray(doctors).filter(
    (d) => d.active !== false,
  ).length;

  const malePatientCount = safeArray(patients).filter(
    (p) => (p.gender || "").toString().toLowerCase() === "male",
  ).length;

  const femalePatientCount = safeArray(patients).filter(
    (p) => (p.gender || "").toString().toLowerCase() === "female",
  ).length;

  const recentPatients = safeArray(patients)
    .filter((p) => p.createdAt)
    .filter((p) => {
      const created = new Date(p.createdAt);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return created >= cutoff;
    }).length;

  const prescriptionCount = safeArray(prescriptions).length;
  const reportCount = safeArray(reports).length;

  const recentAppointments = safeArray(appointments)
    .filter((a) => {
      const status = (a.status || "").toString().toLowerCase();
      return status === "approved" || status === "completed";
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentPrescriptions = safeArray(prescriptions)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentReports = safeArray(reports)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Additional stats data
  const adminsByRole = Object.entries(
    safeArray(admins).reduce((acc, a) => {
      const role = a.role || "unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const departmentBarData = safeArray(departments).map((d) => ({
    name: d.name || "Unknown",
    doctors: d.doctors || 0,
  }));

  // Appointment status pie data (prefer overview if available)
  const apptStatusData =
    overview && overview.apptStatus
      ? Object.entries(overview.apptStatus).map(([k, v]) => ({
          name: k,
          value: v,
        }))
      : Object.entries(
          safeArray(appointments).reduce((acc, a) => {
            const s = (a.status || "unknown").toString().toLowerCase();
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          }, {}),
        ).map(([k, v]) => ({ name: k, value: v }));

  // Doctors by department (prefer overview.doctorsByDept if present)
  const doctorsByDeptData =
    overview && Array.isArray(overview.doctorsByDept)
      ? overview.doctorsByDept.map((d) => ({
          name: d.department || d._id || "Unknown",
          value: d.count || 0,
        }))
      : safeArray(doctors).reduce((acc, d) => {
          const dept = d.department || "Unknown";
          const found = acc.find((x) => x.name === dept);
          if (found) found.value += 1;
          else acc.push({ name: dept, value: 1 });
          return acc;
        }, []);

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
          <div className="super-card-value">
            {safeArray(departments).length}
          </div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Appointments</div>
          <div className="super-card-value">
            {safeArray(appointments).length}
          </div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Completed Appointments</div>
          <div className="super-card-value">{completedAppointmentCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Active Doctors</div>
          <div className="super-card-value">{activeDoctorCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Pending Appointments</div>
          <div className="super-card-value">{pendingAppointmentCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Rejected Appointments</div>
          <div className="super-card-value">{rejectedAppointmentCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Male Patients</div>
          <div className="super-card-value">{malePatientCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Female Patients</div>
          <div className="super-card-value">{femalePatientCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">New Patients (30d)</div>
          <div className="super-card-value">{recentPatients}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Prescriptions</div>
          <div className="super-card-value">{prescriptionCount}</div>
        </div>

        <div className="super-card">
          <div className="super-card-title">Reports</div>
          <div className="super-card-value">{reportCount}</div>
        </div>
      </div>

      {/* Appointment Status Pie Chart */}
      <div className="chart-section">
        <div className="chart-title">Appointment Status</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={apptStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={4}
                label
              >
                {apptStatusData.map((entry, idx) => (
                  <Cell
                    key={`appt-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="activity-row">
        <div className="activity-card">
          <div className="activity-card-title">
            Recent Completed Appointments
          </div>
          <ul>
            {recentAppointments.length > 0 ? (
              recentAppointments.map((item) => (
                <li key={item._id}>
                  {item.patientName || item.patient?.name || "Patient"} •{" "}
                  {item.date || item.createdAt?.slice(0, 10)}
                </li>
              ))
            ) : (
              <li>No completed appointments yet</li>
            )}
          </ul>
        </div>

        <div className="activity-card">
          <div className="activity-card-title">Latest Prescriptions</div>
          <ul>
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((item) => (
                <li key={item._id}>
                  {item.patientName || item.patient?.name || "Patient"} •{" "}
                  {item.prescriptionId || item._id?.slice(-6)}
                </li>
              ))
            ) : (
              <li>No prescriptions yet</li>
            )}
          </ul>
        </div>

        <div className="activity-card">
          <div className="activity-card-title">Latest Reports</div>
          <ul>
            {recentReports.length > 0 ? (
              recentReports.map((item) => (
                <li key={item._id}>
                  {item.caseId || "Report"} •{" "}
                  {item.patientMrNo || item.patient?.mrNo || "-"}
                </li>
              ))
            ) : (
              <li>No reports yet</li>
            )}
          </ul>
        </div>
      </div>

      {/* Departments Bar Chart */}
      <div className="chart-section">
        <div className="chart-title">Departments - Staff Counts</div>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={departmentBarData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="doctors" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Doctors By Department Bar Chart (from overview if available) */}
      <div className="chart-section">
        <div className="chart-title">Doctors by Department</div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={doctorsByDeptData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Admins by Role Pie Chart */}
      <div className="chart-section">
        <div className="chart-title">Admins by Role</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={adminsByRole}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={4}
                label
              >
                {adminsByRole.map((entry, index) => (
                  <Cell
                    key={`admin-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderForm = () => (
    <form onSubmit={handleCreateAdmin} className="super-form">
      <div className="super-form-row">
        <input
          placeholder="Full Name"
          value={newAdmin.name}
          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={newAdmin.email}
          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
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
          onChange={(e) => setNewAdmin({ ...newAdmin, gender: e.target.value })}
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
          <div className="admin-section-title">
            {tabs.find((tab) => tab.key === adminTab)?.label}
          </div>
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
