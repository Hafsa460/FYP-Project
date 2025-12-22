import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../PatientProfileManagement.css";

function ProfileManagement() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "male",
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState({
    open: false,
    type: "", // success | error
    message: "",
  });

  const [show, setShow] = useState({
    oldPassword: false,
    password: false,
    confirmPassword: false,
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("doctorToken");

        const res = await fetch(
          "http://localhost:5000/api/doctor-auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const text = await res.text();
        const data = text.startsWith("{") ? JSON.parse(text) : null;

        if (data?.success) {
          setFormData((prev) => ({
            ...prev,
            name: data.doctor.name,
            gender: data.doctor.gender,
          }));
        }
      } catch (err) {
        setDialog({
          open: true,
          type: "error",
          message: "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validatePasswords = () => {
    const errs = {};
    const { oldPassword, password, confirmPassword } = formData;

    if (password) {
      if (!oldPassword)
        errs.oldPassword = "Old password is required";

      else if (password.length < 8)
        errs.password = "Minimum 8 characters required";

      else if (!/[A-Z]/.test(password))
        errs.password = "Must include uppercase letter";

      else if (!/[a-z]/.test(password))
        errs.password = "Must include lowercase letter";

      else if (!/[0-9]/.test(password))
        errs.password = "Must include a number";

      else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
        errs.password = "Must include special character";

      if (password !== confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswords();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem("doctorToken");

      const payload = {
        name: formData.name,
        gender: formData.gender,
      };

      if (formData.password) {
        payload.oldPassword = formData.oldPassword;
        payload.password = formData.password;
      }

      const res = await fetch(
        "http://localhost:5000/api/doctor-auth/me/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await res.text();
      const data = text.startsWith("{") ? JSON.parse(text) : null;

      if (!data || !data.success) {
        setDialog({
          open: true,
          type: "error",
          message: data?.message || "Profile update failed",
        });
        return;
      }

      setDialog({
        open: true,
        type: "success",
        message: "Profile updated successfully",
      });

      setFormData({
        ...formData,
        oldPassword: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setDialog({
        open: true,
        type: "error",
        message: "Server error. Try again later.",
      });
    }
  };

  if (loading) return <p>Loading...</p>;

  /* ================= UI ================= */
  return (
    <div className="profile-container">
      <h2>Profile Management</h2>

      {dialog.open && (
        <div
          style={{
            background:
              dialog.type === "success" ? "#d4edda" : "#f8d7da",
            color:
              dialog.type === "success" ? "#155724" : "#721c24",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontWeight: 500,
          }}
        >
          {dialog.message}
          <span
            style={{ float: "right", cursor: "pointer" }}
            onClick={() => setDialog({ open: false })}
          >
            ✖
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <hr />

        {/* OLD PASSWORD */}
        <label>Old Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={show.oldPassword ? "text" : "password"}
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
          />
          <span
            onClick={() =>
              setShow({ ...show, oldPassword: !show.oldPassword })
            }
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              cursor: "pointer",
            }}
          >
            {show.oldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
        {errors.oldPassword && (
          <p className="error">{errors.oldPassword}</p>
        )}

        {/* NEW PASSWORD */}
        <label>New Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={show.password ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <span
            onClick={() =>
              setShow({ ...show, password: !show.password })
            }
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              cursor: "pointer",
            }}
          >
            {show.password ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
        {errors.password && (
          <p className="error">{errors.password}</p>
        )}

        {/* CONFIRM PASSWORD */}
        <label>Confirm Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={show.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <span
            onClick={() =>
              setShow({
                ...show,
                confirmPassword: !show.confirmPassword,
              })
            }
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              cursor: "pointer",
            }}
          >
            {show.confirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </span>
        </div>
        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword}</p>
        )}

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default ProfileManagement;
