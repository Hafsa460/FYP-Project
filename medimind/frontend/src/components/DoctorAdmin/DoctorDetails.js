import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { useParams, useNavigate } from "react-router-dom";
=======
import { useParams } from "react-router-dom";
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
import "./DoctorAdmin.css";

export default function DoctorDetails() {
  const { id } = useParams();
<<<<<<< HEAD
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
=======
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("adminToken");

<<<<<<< HEAD
  /* ---------------------------------------------------------
     FETCH ALL DOCTORS (when page loads without an ID)
  --------------------------------------------------------- */
=======
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
  const fetchAllDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctor-admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
<<<<<<< HEAD

      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
=======
      const data = await res.json();
      if (data.success) setDoctors(data.doctors);
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
    } catch (err) {
      console.error("Error loading doctors", err);
    }
  };

<<<<<<< HEAD
  /* ---------------------------------------------------------
     FETCH DOCTOR STATS USING ID
  --------------------------------------------------------- */
  const fetchStats = async () => {
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
=======
  const fetchStats = async () => {
    if (!id) return; // <-- Prevent undefined API call

    try {
      const res = await fetch(`http://localhost:5000/api/doctor-admin/doctor/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setStats(null);
    } catch (err) {
      console.error(err);
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
      setStats(null);
    }
  };

<<<<<<< HEAD
  /* ---------------------------------------------------------
     DELETE DOCTOR
  --------------------------------------------------------- */
=======
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
  const handleDelete = async (doctorId) => {
    if (!window.confirm("Delete this doctor?")) return;

    try {
<<<<<<< HEAD
      const res = await fetch(
        `http://localhost:5000/api/doctor-admin/doctor/${doctorId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchAllDoctors();
      }
=======
      await fetch(`http://localhost:5000/api/doctor-admin/doctor/${doctorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAllDoctors();
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

<<<<<<< HEAD
  /* ---------------------------------------------------------
     INITIAL LOAD: If no ID → load list
     If ID exists → load stats
  --------------------------------------------------------- */
  useEffect(() => {
    if (!id) {
      fetchAllDoctors();
    } else {
      fetchStats();
    }
=======
  useEffect(() => {
    fetchAllDoctors();
    fetchStats();
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
  }, [id]);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

<<<<<<< HEAD
  /* ---------------------------------------------------------
     MODE 1: NO ID → SHOW DOCTOR LIST
  --------------------------------------------------------- */
=======
  /* ----------------------------------------------
     PAGE VERSION: NO ID → Only show Doctor List
  ---------------------------------------------- */
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
  if (!id) {
    return (
      <div className="doctor-details">
        <h3>Doctors</h3>

        <input
          placeholder="Search doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <div className="cards-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <div className="d-header">
                <div className="d-name">{doc.name}</div>
                <div className="d-dept">{doc.department}</div>
              </div>

              <div><strong>Designation:</strong> {doc.designation}</div>
              <div><strong>Phone:</strong> {doc.pno}</div>

              <button
<<<<<<< HEAD
                onClick={() => navigate(`/doctor-admin/doctor/${doc._id}`)}
=======
                onClick={() =>
                  (window.location.href = `/doctor-admin/doctor/${doc._id}`)
                }
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
              >
                View Details
              </button>

              <button
                onClick={() => handleDelete(doc._id)}
                style={{ color: "red", marginTop: 5 }}
              >
                Delete Doctor
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  /* ---------------------------------------------------------
     MODE 2: ID EXISTS → SHOW STATS
  --------------------------------------------------------- */

=======
  /* ----------------------------------------------
     PAGE VERSION: ID EXISTS → Show Full Stats
  ---------------------------------------------- */
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
  if (!stats) return <div>Loading doctor stats...</div>;

  return (
    <div className="doctor-details">

<<<<<<< HEAD
      <button className="back-btn" onClick={() => navigate("/doctor-admin")}>
        ← Back
      </button>

=======
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
      <h3>{stats.doctorInfo?.name}</h3>

      <div className="detail-grid">
        <div className="left">
          <div className="info-card">
            <div><strong>Department:</strong> {stats.doctorInfo?.department}</div>
            <div><strong>Designation:</strong> {stats.doctorInfo?.designation}</div>
<<<<<<< HEAD

            <div>
              <strong>Working Hours:</strong>{" "}
              {stats.doctorInfo?.workingHours?.start} -{" "}
              {stats.doctorInfo?.workingHours?.end}
            </div>

            <div>
              <strong>Joined:</strong>{" "}
              {new Date(stats.doctorInfo?.createdAt).toLocaleDateString()}
            </div>

=======
            <div>
              <strong>Working Hours:</strong> {stats.doctorInfo?.workingHours?.start} -{" "}
              {stats.doctorInfo?.workingHours?.end}
            </div>
            <div>
              <strong>Joined:</strong>
              {new Date(stats.doctorInfo?.createdAt).toLocaleDateString()}
            </div>
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
            <div><strong>Total Appointments:</strong> {stats.totalAppointments}</div>
            <div><strong>Total Prescriptions:</strong> {stats.totalPrescriptions}</div>
            <div><strong>Total Patients:</strong> {stats.totalPatients}</div>
          </div>
        </div>

        <div className="right">
          <div className="chart-card">
            <h4>Patient Gender Ratio</h4>
<<<<<<< HEAD
            {/* Chart goes here */}
=======
            {/* Your chart here */}
>>>>>>> cd1d7f4d635abf68ff7ca27b25dc4624b911e0bc
          </div>
        </div>
      </div>
    </div>
  );
}
