import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import adminNotificationService from "../../services/AdminNotificationService";
import "../PatientAdmin/PatientAdmin.css";
import AdminNavbar from "../AdminNavbar";

export default function ManageDepartments() {
  const { admin } = useOutletContext() || {};
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [doctors, setDoctors] = useState(0);
  const [nurses, setNurses] = useState(0);
  const [staff, setStaff] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [editDept, setEditDept] = useState(null);
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

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !name.trim()) {
      setError("Name is required");
      return;
    }
    setConfirmData({
      name: name.trim(),
      description: desc,
      doctors,
      nurses,
      staff,
      rooms,
    });
  };

  const handleDelete = async (id) => {
    setDeleteDialog({ show: true, id });
  };

  const handleEditClick = (dept) => {
    setError("");
    setEditDept({
      id: dept._id || dept.id,
      name: dept.name || "",
      description: dept.description || "",
      doctors: dept.doctors || 0,
      nurses: dept.nurses || 0,
      staff: dept.staff || 0,
      rooms: dept.rooms || 0,
    });
  };

  const handleEditChange = (field, value) => {
    setEditDept((prev) => ({ ...prev, [field]: value }));
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
        // Send notification
        adminNotificationService.notifyDepartmentAdded(
          admin?.id,
          admin?.name,
          confirmData.name,
        );
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
      const deptToDelete = departments.find(
        (d) => d._id === deleteDialog.id || d.id === deleteDialog.id,
      );
      await fetch(`http://localhost:5000/api/departments/${deleteDialog.id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      // Send notification
      adminNotificationService.notifyDepartmentDeleted(
        admin?.id,
        admin?.name,
        deptToDelete?.name || "Unknown",
      );
      setDeleteDialog({ show: false, id: null });
      fetchDepts();
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div>
      <AdminNavbar />
      <h2>Manage Departments</h2>
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setShowAddModal(true);
          setError("");
        }}
      >
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
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Doctors</label>
                <input
                  value={doctors}
                  onChange={(e) =>
                    setDoctors(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <div className="form-group">
                <label>Nurses</label>
                <input
                  value={nurses}
                  onChange={(e) => setNurses(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="form-group">
                <label>Staff</label>
                <input
                  value={staff}
                  onChange={(e) => setStaff(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="form-group">
                <label>Rooms</label>
                <input
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Next: Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editDept && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h4>Edit Department</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const token = localStorage.getItem("adminToken");
                const updateDepartment = async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5000/api/departments/${editDept.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: token ? `Bearer ${token}` : undefined,
                        },
                        body: JSON.stringify({
                          name: editDept.name.trim(),
                          description: editDept.description,
                          doctors: Number(editDept.doctors) || 0,
                          nurses: Number(editDept.nurses) || 0,
                          staff: Number(editDept.staff) || 0,
                          rooms: Number(editDept.rooms) || 0,
                        }),
                      },
                    );
                    const data = await res.json();
                    if (!res.ok) {
                      setError(data?.message || "Failed to update department");
                      return;
                    }
                    setEditDept(null);
                    fetchDepts();
                  } catch (err) {
                    setError("Failed to update department");
                  }
                };
                updateDepartment();
              }}
            >
              <div className="form-group">
                <label>Name</label>
                <input
                  value={editDept.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  value={editDept.description}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Doctors</label>
                <input
                  value={editDept.doctors}
                  onChange={(e) =>
                    handleEditChange(
                      "doctors",
                      e.target.value.replace(/\D/g, ""),
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label>Nurses</label>
                <input
                  value={editDept.nurses}
                  onChange={(e) =>
                    handleEditChange(
                      "nurses",
                      e.target.value.replace(/\D/g, ""),
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label>Staff</label>
                <input
                  value={editDept.staff}
                  onChange={(e) =>
                    handleEditChange("staff", e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <div className="form-group">
                <label>Rooms</label>
                <input
                  value={editDept.rooms}
                  onChange={(e) =>
                    handleEditChange("rooms", e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditDept(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmData && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h4>Confirm Department</h4>
            <p>
              <strong>Name:</strong> {confirmData.name}
            </p>
            <p>
              <strong>Description:</strong> {confirmData.description}
            </p>
            <p>
              <strong>Doctors:</strong> {confirmData.doctors}
            </p>
            <p>
              <strong>Nurses:</strong> {confirmData.nurses}
            </p>
            <p>
              <strong>Staff:</strong> {confirmData.staff}
            </p>
            <p>
              <strong>Rooms:</strong> {confirmData.rooms}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmData(null)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmAdd}>
                Confirm Add
              </button>
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
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteDialog({ show: false, id: null })}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
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
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleEditClick(d)}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(d._id || d.id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
