import React, { useEffect, useState } from "react";
import "../PatientAdmin/PatientAdmin.css";

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    doctors: 0,
    nurses: 0,
    staff: 0,
    rooms: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          doctors: Number(form.doctors),
          nurses: Number(form.nurses),
          staff: Number(form.staff),
          rooms: Number(form.rooms),
        }),
      });
      if (res.ok) {
        setForm({ name: "", description: "", doctors: 0, nurses: 0, staff: 0, rooms: 0 });
        setShowForm(false);
        fetchDepartments();
      } else {
        setError("Failed to add department");
      }
    } catch (err) {
      setError("Failed to add department");
    }
  };

  return (
    <div className="department-management">
      <h2>Department Management</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Department"}
      </button>
      {showForm && (
        <form onSubmit={handleAddDepartment} className="mb-3">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Department Name"
            className="form-control d-inline w-auto me-2"
            required
          />
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="form-control d-inline w-auto me-2"
          />
          <input
            type="number"
            name="doctors"
            value={form.doctors}
            onChange={handleInputChange}
            placeholder="Doctors"
            className="form-control d-inline w-auto me-2"
            min="0"
          />
          <input
            type="number"
            name="nurses"
            value={form.nurses}
            onChange={handleInputChange}
            placeholder="Nurses"
            className="form-control d-inline w-auto me-2"
            min="0"
          />
          <input
            type="number"
            name="staff"
            value={form.staff}
            onChange={handleInputChange}
            placeholder="Staff"
            className="form-control d-inline w-auto me-2"
            min="0"
          />
          <input
            type="number"
            name="rooms"
            value={form.rooms}
            onChange={handleInputChange}
            placeholder="Rooms"
            className="form-control d-inline w-auto me-2"
            min="0"
          />
          <button type="submit" className="btn btn-success">Save</button>
        </form>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Loading departments...</div>
      ) : (
        <ul className="list-group">
          {departments.map((dept) => (
            <li key={dept._id} className="list-group-item">
              <strong>{dept.name}</strong> <span className="text-muted small">({dept.description})</span>
              <div className="text-muted small">
                Doctors: {dept.doctors ?? 0}, Nurses: {dept.nurses ?? 0}, Staff: {dept.staff ?? 0}, Rooms: {dept.rooms ?? 0}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DepartmentManagement;
