import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorAdmin.css";

const DoctorAdminDashboard = () => {
  const [overview, setOverview] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token"); // doctorAdmin token

  // Fetch dashboard overview
  const fetchOverview = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor-admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverview(res.data);
    } catch (err) {
      console.error("Error fetching overview", err);
    }
  };

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctor-admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchDoctors();
  }, []);

  // Approve doctor edit request
  const handleApproveEdit = async (doctorId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/doctor-admin/doctor-edit/${doctorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Doctor edit request approved!");
      fetchDoctors();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error approving edit", err);
      setMessage("Failed to approve edit request");
    }
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="doctor-admin-dashboard">
      <h2>Doctor Admin Dashboard</h2>
      {message && <p className="message">{message}</p>}

      {/* Overview Section */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total Doctors</h3>
          <p>{overview.totalDoctors || 0}</p>
        </div>
        <div className="card">
          <h3>Total Appointments</h3>
          <p>{overview.totalAppointments || 0}</p>
        </div>
        <div className="card">
          <h3>Departments</h3>
          <p>{overview.departments ? overview.departments.length : 0}</p>
        </div>
      </div>

      {/* Search Doctors */}
      <input
        type="text"
        placeholder="Search doctor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* Doctor List */}
      <table className="doctor-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Edit Request</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.map((doctor) => (
            <tr key={doctor._id}>
              <td>{doctor.name}</td>
              <td>{doctor.department}</td>
              <td>{doctor.email}</td>
              <td>{doctor.pno}</td>
              <td>{doctor.editRequest ? "Pending" : "No"}</td>
              <td>
                <button onClick={() => setSelectedDoctor(doctor)}>View</button>
                {doctor.editRequest && (
                  <button onClick={() => handleApproveEdit(doctor._id)}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="modal">
          <div className="modal-content">
            <h3>Doctor Details</h3>
            <p><b>Name:</b> {selectedDoctor.name}</p>
            <p><b>Email:</b> {selectedDoctor.email}</p>
            <p><b>Department:</b> {selectedDoctor.department}</p>
            <p><b>Designation:</b> {selectedDoctor.designation}</p>
            <button onClick={() => setSelectedDoctor(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAdminDashboard;
