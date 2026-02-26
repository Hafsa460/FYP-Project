import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "../PatientAdmin/PatientAdmin.css";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [doctors, setDoctors] = useState(0);
  const [nurses, setNurses] = useState(0);
  const [staff, setStaff] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });
  const [error, setError] = useState("");

  const fetchDepts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !name.trim()) {
      setError("Name is required");
      return;
    }
    setConfirmData({ name: name.trim(), description: desc, doctors, nurses, staff, rooms });
  };

  const handleDelete = async (id) => {
    setDeleteDialog({ show: true, id });
  };

  const handleConfirmAdd = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          name: confirmData.name,
          description: confirmData.description,
          doctors: Number(confirmData.doctors) || 0,
          nurses: Number(confirmData.nurses) || 0,
          staff: Number(confirmData.staff) || 0,
          rooms: Number(confirmData.rooms) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setName("");
        setDesc("");
        setDoctors(0);
        setNurses(0);
        setStaff(0);
        setRooms(0);
        setShowAddModal(false);
        setConfirmData(null);
        fetchDepts();
      } else {
        setError(data?.message || "Failed to add department");
      }
    } catch (err) {
      setError("Failed to add department");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`http://localhost:5000/api/departments/${deleteDialog.id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setDeleteDialog({ show: false, id: null });
      fetchDepts();
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div>
      <h2>Manage Departments</h2>
      <button className="btn btn-primary mb-3" onClick={() => { setShowAddModal(true); setError(""); }}>
        Add Department
      </button>

      {showAddModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h4>Add Department</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Doctors</label>
                <input value={doctors} onChange={(e) => setDoctors(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="form-group">
                <label>Nurses</label>
                <input value={nurses} onChange={(e) => setNurses(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="form-group">
                <label>Staff</label>
                <input value={staff} onChange={(e) => setStaff(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="form-group">
                <label>Rooms</label>
                <input value={rooms} onChange={(e) => setRooms(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Next: Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmData && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h4>Confirm Department</h4>
            <p><strong>Name:</strong> {confirmData.name}</p>
            <p><strong>Description:</strong> {confirmData.description}</p>
            <p><strong>Doctors:</strong> {confirmData.doctors}</p>
            <p><strong>Nurses:</strong> {confirmData.nurses}</p>
            <p><strong>Staff:</strong> {confirmData.staff}</p>
            <p><strong>Rooms:</strong> {confirmData.rooms}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setConfirmData(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleConfirmAdd}>Confirm Add</button>
            </div>
          </div>
        </div>
      )}

      {deleteDialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this department?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setDeleteDialog({ show: false, id: null })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="cards-grid" style={{ marginTop: 16 }}>
        {departments.map((d) => (
          <div className="patient-card" key={d._id || d.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="d-name">{d.name}</div>
                <div className="d-dept">{d.description}</div>
              </div>
              <div>
                <button onClick={() => handleDelete(d._id || d.id)} className="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


