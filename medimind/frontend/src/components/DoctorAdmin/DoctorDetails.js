import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DoctorAdmin.css";

export default function DoctorDetails() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchAllDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctor-admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDoctors(data.doctors);
    } catch (err) {
      console.error("Error loading doctors", err);
    }
  };

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
      setStats(null);
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Delete this doctor?")) return;

    try {
      await fetch(`http://localhost:5000/api/doctor-admin/doctor/${doctorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAllDoctors();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    fetchAllDoctors();
    fetchStats();
  }, [id]);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ----------------------------------------------
     PAGE VERSION: NO ID → Only show Doctor List
  ---------------------------------------------- */
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
                onClick={() =>
                  (window.location.href = `/doctor-admin/doctor/${doc._id}`)
                }
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

  /* ----------------------------------------------
     PAGE VERSION: ID EXISTS → Show Full Stats
  ---------------------------------------------- */
  if (!stats) return <div>Loading doctor stats...</div>;

  return (
    <div className="doctor-details">

      <h3>{stats.doctorInfo?.name}</h3>

      <div className="detail-grid">
        <div className="left">
          <div className="info-card">
            <div><strong>Department:</strong> {stats.doctorInfo?.department}</div>
            <div><strong>Designation:</strong> {stats.doctorInfo?.designation}</div>
            <div>
              <strong>Working Hours:</strong> {stats.doctorInfo?.workingHours?.start} -{" "}
              {stats.doctorInfo?.workingHours?.end}
            </div>
            <div>
              <strong>Joined:</strong>
              {new Date(stats.doctorInfo?.createdAt).toLocaleDateString()}
            </div>
            <div><strong>Total Appointments:</strong> {stats.totalAppointments}</div>
            <div><strong>Total Prescriptions:</strong> {stats.totalPrescriptions}</div>
            <div><strong>Total Patients:</strong> {stats.totalPatients}</div>
          </div>
        </div>

        <div className="right">
          <div className="chart-card">
            <h4>Patient Gender Ratio</h4>
            {/* Your chart here */}
          </div>
        </div>
      </div>
    </div>
  );
}
