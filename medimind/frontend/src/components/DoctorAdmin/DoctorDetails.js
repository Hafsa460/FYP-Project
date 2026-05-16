import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ClipboardList, FileText, Users, CheckCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import adminNotificationService from "../../services/AdminNotificationService";
import "./DoctorAdmin.css";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useOutletContext() || {};

  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("view");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
    gender: "",
    leaveDays: [],
    workingHours: { start: "08:00", end: "14:00" },
  });
  const [departments] = useState(["Cardiology", "Neurology", "Orthopedics", "Dermatology", "Pediatrics"]); // Example
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialog, setDialog] = useState({ show: false, type: "", message: "", onConfirm: null });

  const showDialog = (type, message) => {
    setDialog({ show: true, type, message, onConfirm: null });
  };

  const showConfirmDialog = (message, onConfirm) => {
    setDialog({ show: true, type: "confirm", message, onConfirm });
  };

  const closeDialog = () => {
    setDialog({ show: false, type: "", message: "", onConfirm: null });
  };

  const handleDialogConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    closeDialog();
  };

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

  /* ---------------------------------------------------------
     FETCH ALL DOCTORS (when page loads without an ID)
  --------------------------------------------------------- */
  const fetchAllDoctors = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctor-admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error("Error loading doctors", err);
    }
  }, [token]);

  /* ---------------------------------------------------------
     FETCH DOCTOR STATS USING ID
  --------------------------------------------------------- */
  const fetchStats = useCallback(async () => {
    if (!id) return; // Don't fetch if user is only on list view

    try {
      const res = await fetch(
        `http://localhost:5000/api/doctor-admin/doctor/${id}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Error fetching stats", err);
      setStats(null);
    }
  }, [id, token]);

  /* ---------------------------------------------------------
     FETCH APPOINTMENTS FOR DOCTOR
  --------------------------------------------------------- */
  const fetchAppointments = useCallback(async () => {
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/doctor/${id}`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments", err);
    }
  }, [id]);

  /* ---------------------------------------------------------
     DELETE DOCTOR (SOFT DELETE - DEACTIVATE)
  --------------------------------------------------------- */
  const handleDelete = async (doctorId) => {
    showConfirmDialog(
      "Are you sure you want to deactivate this doctor?",
      async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/doctor-admin/doctor/${doctorId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await res.json();
          if (data.success) {
            showDialog("success", "Doctor deactivated successfully!");
            adminNotificationService.notifyDoctorDeleted(admin?.id, admin?.name, data.doctor?.name || "Unknown");
            fetchAllDoctors();
          } else {
            showDialog("error", data.error || "Failed to deactivate doctor");
          }
        } catch (err) {
          console.error("Delete failed", err);
          showDialog("error", "Failed to deactivate doctor");
        }
      }
    );
  };

  /* ---------------------------------------------------------
     REACTIVATE DOCTOR
  --------------------------------------------------------- */
  const handleReactivate = async (doctorId, isVerified) => {
    if (isVerified === false) {
      showDialog("error", "Cannot reactivate this doctor because email is not verified.");
      return;
    }

    showConfirmDialog(
      "Are you sure you want to reactivate this doctor?",
      async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/doctor-admin/doctor/${doctorId}/reactivate`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await res.json();
          if (data.success) {
            showDialog("success", "Doctor reactivated successfully!");
            adminNotificationService.notifyDoctorUpdated(admin?.id, admin?.name, data.doctor?.name || "Unknown");
            fetchAllDoctors();
          } else {
            showDialog("error", data.error || "Failed to reactivate doctor");
          }
        } catch (err) {
          console.error("Reactivate failed", err);
          showDialog("error", "Failed to reactivate doctor");
        }
      }
    );
  };

  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email || !/^[^\s@]+@gmail\.com$/.test(formData.email)) newErrors.email = "Valid Gmail required";
    if (!validatePassword(formData.password)) newErrors.password = "Password must be 8+ chars with uppercase, lowercase, number & special char";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (!formData.department) newErrors.department = "Department required";
    if (!formData.designation.trim()) newErrors.designation = "Designation required";
    if (!formData.gender) newErrors.gender = "Gender required";
    if (!formData.workingHours.start.trim()) newErrors.startTime = "Start time is required";
    if (!formData.workingHours.end.trim()) newErrors.endTime = "End time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/doctor-admin/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showDialog("success", "Doctor added and verification email sent!");
        // Send notification
        adminNotificationService.notifyDoctorAdded(admin?.id, admin?.name, formData.name);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          department: "",
          designation: "",
          gender: "",
          leaveDays: [],
          workingHours: { start: "08:00", end: "14:00" },
        });
        fetchAllDoctors();
      } else {
        showDialog("error", data.error || "Error adding doctor");
      }
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  /* ---------------------------------------------------------
     INITIAL LOAD: If no ID → load list
     If ID exists → load stats and appointments
  --------------------------------------------------------- */
  useEffect(() => {
    if (!id) {
      fetchAllDoctors();
    } else {
      fetchStats();
      fetchAppointments();
    }
  }, [id, fetchAllDoctors, fetchStats, fetchAppointments]);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.department.toLowerCase().includes(search.toLowerCase()) ||
    doc.designation.toLowerCase().includes(search.toLowerCase())
  );

  const activeDoctors = filteredDoctors.filter(doc => doc.active && doc.isVerified);
  const inactiveDoctors = filteredDoctors.filter(doc => !doc.active || !doc.isVerified);

  /* ---------------------------------------------------------
     MODE 1: NO ID → SHOW DOCTOR LIST
  --------------------------------------------------------- */
  if (!id) {
    return (
      <div className="doctor-details">
        <div className="tabs">
          <button className={activeTab === "view" ? "active" : ""} onClick={() => setActiveTab("view")}>View Doctors</button>
          <button className={activeTab === "manage" ? "active" : ""} onClick={() => setActiveTab("manage")}>Manage Doctors</button>
        </div>

        {activeTab === "view" && (
          <>
            <h3>Doctors</h3>
            <input
              placeholder="Search by name, department, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 10 }}
            />

            <h4>Active Doctors</h4>
            <div className="cards-grid">
              {activeDoctors.map((doc) => (
                <div key={doc._id} className="doctor-card">
                  <div className="d-header">
                    <img
                      src={doc.gender === "male" ? maleProfile : femaleProfile}
                      alt="Profile"
                      className="profile-icon"
                    />
                    <div>
                      <div className="d-name">{doc.name}</div>
                      <div className="d-dept">{doc.department}</div>
                    </div>
                  </div>
                  <div><strong>Designation:</strong> {doc.designation}</div>
                  <div><strong>Phone:</strong> {doc.pno}</div>
                  <button onClick={() => navigate(`/doctor-admin/doctor/${doc._id}`)}>View Details</button>
                  <button onClick={() => handleDelete(doc._id)} style={{ color: "white", marginTop: 5 }}>Deactivate Doctor</button>
                </div>
              ))}
            </div>

            <h4>Deactivated Doctors</h4>
            <div className="cards-grid">
              {inactiveDoctors.map((doc) => (
                <div key={doc._id} className="doctor-card inactive">
                  <div className="d-header">
                    <img
                      src={doc.gender === "male" ? maleProfile : femaleProfile}
                      alt="Profile"
                      className="profile-icon"
                    />
                    <div>
                      <div className="d-name">{doc.name}</div>
                      <div className="d-dept">{doc.department}</div>
                    </div>
                  </div>
                  <div><strong>Designation:</strong> {doc.designation}</div>
                  <div><strong>Phone:</strong> {doc.pno}</div>
                  <div><strong>Status:</strong> {doc.active ? "Unverified" : "Deactivated"}</div>
                  <button onClick={() => handleReactivate(doc._id, doc.isVerified)} style={{ color: "white", marginTop: 5 }}>Reactivate Doctor</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "manage" && (
          <div>
            <h3>Add New Doctor</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div>
                <label>Password:</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleFormChange}
                    name="password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
              <div>
                <label>Confirm Password:</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleFormChange}
                    name="confirmPassword"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
              <div>
                <label>Department:</label>
                <select name="department" value={formData.department} onChange={handleFormChange}>
                  <option value="">Select</option>
                  {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                {errors.department && <span className="error">{errors.department}</span>}
              </div>
              <div>
                <label>Designation:</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleFormChange} />
                {errors.designation && <span className="error">{errors.designation}</span>}
              </div>
              <div>
                <label>Gender:</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <span className="error">{errors.gender}</span>}
              </div>
              <div>
                <label>Working Hours Start:</label>
                <input type="time" value={formData.workingHours.start} onChange={(e) => { setFormData({ ...formData, workingHours: { ...formData.workingHours, start: e.target.value } }); if (errors.startTime) setErrors({ ...errors, startTime: "" }); }} />
                {errors.startTime && <span className="error">{errors.startTime}</span>}
              </div>
              <div>
                <label>Working Hours End:</label>
                <input type="time" value={formData.workingHours.end} onChange={(e) => { setFormData({ ...formData, workingHours: { ...formData.workingHours, end: e.target.value } }); if (errors.endTime) setErrors({ ...errors, endTime: "" }); }} />
                {errors.endTime && <span className="error">{errors.endTime}</span>}
              </div>
              <button type="submit">Add Doctor</button>
            </form>
          </div>
        )}

        {/* Professional Dialog */}
        {dialog.show && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <div className="dialog-header">
                <h3>
                  {dialog.type === "success" ? "Success" :
                   dialog.type === "error" ? "Error" :
                   dialog.type === "confirm" ? "Confirm Action" : ""}
                </h3>
              </div>
              <div className="dialog-body">
                <p>{dialog.message}</p>
              </div>
              <div className="dialog-footer">
                {dialog.type === "confirm" ? (
                  <>
                    <button onClick={closeDialog} className="dialog-btn cancel-btn">Cancel</button>
                    <button onClick={handleDialogConfirm} className="dialog-btn">Yes</button>
                  </>
                ) : (
                  <button onClick={closeDialog} className="dialog-btn">OK</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------
     MODE 2: ID EXISTS → SHOW STATS
  --------------------------------------------------------- */

  if (!stats) return <div>Loading doctor stats...</div>;

  // Calculate appointment counts
  let pendingAppointments = 0;
  let completedAppointments = 0;
  appointments.forEach((a) => {
    if (a.status === "Pending") pendingAppointments++;
    if (a.status === "Completed") completedAppointments++;
  });

  const genderData = [
    { name: "Male", value: stats.genderStats?.male || 0 },
    { name: "Female", value: stats.genderStats?.female || 0 },
  ].filter((item) => item.value > 0);

  const COLORS = ["#3b82f6", "#ec4899"]; // blue = Male, pink = Female

  return (
    <div className="main-content">
      <button className="back-btn" onClick={() => navigate("/doctor-admin/doctors")}>
        ← Back to Doctors
      </button>

      {/* Doctor Card */}
      <div className="doctor-card d-flex align-items-center mb-4 p-3 shadow-sm rounded">
        <img
          src={stats.doctorInfo?.gender === "male" ? maleProfile : femaleProfile}
          alt="Doctor"
          className="profile-icon"
        />
        <div>
          <div className="fw-bold fs-5">{stats.doctorInfo?.name}</div>
          <div className="text-muted">{stats.doctorInfo?.designation}</div>
          <div className="text-muted">{stats.doctorInfo?.department}</div>
          <div className="text-secondary mt-1">
            {stats.totalAppointments} total appointments
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="card-grid mb-4">
        <div className="card">
          <div className="fw-bold">Total Appointments</div>
          <div className="fs-4">{stats.totalAppointments}</div>
        </div>
        <div className="card">
          <div className="fw-bold">Pending Appointments</div>
          <div className="fs-4 text-warning">{pendingAppointments}</div>
        </div>
        <div className="card">
          <div className="fw-bold">Completed Appointments</div>
          <div className="fs-4 text-success">{completedAppointments}</div>
        </div>
        <div className="card">
          <div className="fw-bold">Patients Treated</div>
          <div className="fs-4 text-primary">{stats.totalPatients}</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid mt-4">
        {/* Gender Pie Chart */}
        <div className="chart-section small-card">
          <div className="section-title">Patient Gender Distribution</div>
          {stats.totalPatients > 0 && genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) =>
                    value > 0 ? `${name} (${value})` : ""
                  }
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No gender data available</p>
          )}
        </div>

        {/* Quick Insights */}
        <div className="chart-section small-card">
          <div className="section-title">Quick Insights</div>
          <ul>
            <li>
              <ClipboardList size={16} className="me-2" />{" "}
              {stats.totalAppointments} total appointments handled
            </li>
            <li>
              <Clock size={16} className="me-2" />{" "}
              {pendingAppointments} appointments pending
            </li>
            <li>
              <CheckCircle size={16} className="me-2" />{" "}
              {completedAppointments} appointments completed
            </li>
            <li>
              <Users size={16} className="me-2" /> {stats.totalPatients}{" "}
              patients treated
            </li>
            <li>
              <FileText size={16} className="me-2" />{" "}
              {stats.totalPrescriptions} prescriptions written
            </li>
          </ul>
        </div>
      </div>

      {/* Professional Dialog */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>{dialog.type === "success" ? "Success" : "Error"}</h3>
            </div>
            <div className="dialog-body">
              <p>{dialog.message}</p>
            </div>
            <div className="dialog-footer">
              <button onClick={closeDialog} className="dialog-btn">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}