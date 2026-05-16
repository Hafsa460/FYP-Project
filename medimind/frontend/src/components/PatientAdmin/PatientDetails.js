import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ClipboardList, FileText } from "lucide-react";
import adminNotificationService from "../../services/AdminNotificationService";
import "./PatientAdmin.css";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useOutletContext() || {};

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("view");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState({ show: false, type: "", message: "" });

  const token = localStorage.getItem("adminToken");

  const showDialog = (type, message) => {
    setDialog({ show: true, type, message });
  };
  const closeDialog = () => setDialog({ show: false, type: "", message: "" });

  /* ---------------- FETCH PATIENTS ---------------- */
  const fetchAllPatients = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/adminpatient", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) return showDialog("error", data.error);
      setPatients(data);
    } catch (err) {
      showDialog("error", "Failed to fetch patients");
    }
  }, [token]);

  // ✅ Correct useEffect for async
  useEffect(() => {
    let isMounted = true; // optional flag to prevent state updates if unmounted

    const fetchData = async () => {
      await fetchAllPatients();
    };

    fetchData();

    return () => {
      // Cleanup if needed in future (e.g., cancel subscriptions)
      isMounted = false;
    };
  }, [fetchAllPatients]);

  /* ---------------- FILTER ---------------- */
  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.mrNo?.toString().includes(search.toLowerCase())
  );

  const verifiedPatients = filteredPatients.filter((p) => p.isVerified);
  const unverifiedPatients = filteredPatients.filter((p) => !p.isVerified);

  /* ---------------- FORM HANDLING ---------------- */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  const newErrors = {};
  if (!formData.name) newErrors.name = "Name required";
  if (!/^[^\s@]+@gmail\.com$/.test(formData.email))
    newErrors.email = "Valid Gmail required";
  if (!formData.gender) newErrors.gender = "Gender required";
  if (!formData.dob) newErrors.dob = "Date of Birth required";
  if (!formData.password) newErrors.password = "Password required";
  if (formData.password !== formData.confirmPassword)
    newErrors.confirmPassword = "Passwords do not match";

  if (Object.keys(newErrors).length) {
    setErrors(newErrors);
    return;
  }

  // Calculate age from DOB
  const birthDate = new Date(formData.dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  try {
    const res = await fetch("http://localhost:5000/api/adminpatient/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...formData, age }),
    });

    const data = await res.json();

    if (data.message) {
      showDialog("success", data.message);
      // Send notification
      adminNotificationService.notifyPatientAdded(admin?.id, admin?.name, formData.name);
      setFormData({
        name: "",
        email: "",
        dob: "",
        gender: "",
        password: "",
        confirmPassword: "",
      });
      fetchAllPatients();
    } else if (data.error === "Patient already exists (verified)") {
      // Email already registered
      showDialog("error", "Email already registered.");
    } else if (data.error === "Patient exists but unverified") {
      // Resend verification
      showDialog(
        "success",
        "Patient email exists but not verified. Verification email resent."
      );
      setFormData({
        name: "",
        email: "",
        dob: "",
        gender: "",
        password: "",
        confirmPassword: "",
      });
      fetchAllPatients();
    } else {
      showDialog("error", data.error);
    }
  } catch {
    showDialog("error", "Server error");
  }
};


  /* ---------------- SINGLE PATIENT VIEW ---------------- */
  if (id) {
    const patient = patients.find((p) => p._id === id);
    if (!patient) return <div>Patient not found</div>;

    return (
      <div className="doctor-details">
        <h2>Patient Details: {patient.name}</h2>

        <div className="patient-info">
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>MR No:</strong> {patient.mrNo}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Verified:</strong> {patient.isVerified ? "Yes" : "No"}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <ClipboardList />
            <div>
              <h3>Appointments</h3>
              <p>0</p>
            </div>
          </div>
          <div className="stat-card">
            <FileText />
            <div>
              <h3>Prescriptions</h3>
              <p>0</p>
            </div>
          </div>
        </div>

        <button onClick={() => navigate("/patient-admin")}>Back to Patients</button>
      </div>
    );
  }

  /* ---------------- MAIN PAGE ---------------- */
  return (
    <div className="patient-admin">
      <h1>Patient Administration</h1>

      <div className="tabs">
        <button
          className={activeTab === "view" ? "tab active" : "tab"}
          onClick={() => setActiveTab("view")}
        >
          View Patients
        </button>
        <button
          className={activeTab === "manage" ? "tab active" : "tab"}
          onClick={() => setActiveTab("manage")}
        >
          Manage Patients
        </button>
      </div>

      {activeTab === "view" && (
        <>
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <h3>Verified Patients</h3>
          <div className="cards-grid">
            {verifiedPatients.map((p) => (
              <div key={p._id} className="patient-card">
                <div className="d-header">
                  <img
                    src={p.gender === "Male" ? maleProfile : femaleProfile}
                    alt="Profile"
                    className="profile-icon"
                  />
                  <div>
                    <div className="d-name">{p.name}</div>
                    <div className="d-dept">{p.email}</div>
                  </div>
                </div>
                <div><strong>MR No:</strong> {p.mrNo}</div>
                <div><strong>Age:</strong> {p.age}</div>
                <button onClick={() => navigate(`/patient-admin/patient/${p._id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>

          <h3>Unverified Patients</h3>
          <div className="cards-grid">
            {unverifiedPatients.map((p) => (
              <div key={p._id} className="patient-card inactive">
                <div className="d-header">
                  <img
                    src={p.gender === "Male" ? maleProfile : femaleProfile}
                    alt="Profile"
                    className="profile-icon"
                  />
                  <div>
                    <div className="d-name">{p.name}</div>
                    <div className="d-dept">{p.email}</div>
                  </div>
                </div>
                <div><strong>MR No:</strong> {p.mrNo}</div>
                <div><strong>Age:</strong> {p.age}</div>
                <button onClick={() => navigate(`/patient-admin/patient/${p._id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "manage" && (
        <form onSubmit={handleSubmit} className="patient-details">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleFormChange} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleFormChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>DOB</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} />
            {errors.dob && <span className="error">{errors.dob}</span>}
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleFormChange}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            {errors.gender && <span className="error">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleFormChange}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit">Add Patient</button>
        </form>
      )}

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
