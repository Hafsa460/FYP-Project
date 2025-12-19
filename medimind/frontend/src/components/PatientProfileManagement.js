import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "./PatientProfileManagement.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PatientProfileManagement() {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    dob: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [messages, setMessages] = useState({
    profile: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, []);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data) {
        setForm({
          name: data.name || "",
          dob: data.dob?.substring(0, 10) || "",
          gender: data.gender || "",
          password: "",
          confirmPassword: "",
        });
        setEmail(data.email || "");
        localStorage.setItem("patient", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error fetching patient:", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEmailChange = (e) => setEmail(e.target.value);

  // UPDATE PROFILE
  const updateProfile = async () => {
    setErrors({ ...errors, general: "" });
    setMessages({ ...messages, profile: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          dob: form.dob,
          gender: form.gender,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setErrors((prev) => ({ ...prev, general: data.error }));
      } else {
        setMessages((prev) => ({ ...prev, profile: data.message }));
        fetchPatient();
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, general: "Something went wrong!" }));
    }
  };

  // REQUEST EMAIL CHANGE
  const requestEmailChange = async () => {
    setErrors({ ...errors, email: "" });
    setMessages({ ...messages, email: "" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Please enter a new email." }));
      return;
    }

    const patient = JSON.parse(localStorage.getItem("patient"));
    try {
      const res = await fetch("http://localhost:5000/api/users/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: email, mrNo: patient?.mrNo }),
      });
      const data = await res.json();

      if (data.error) {
        setErrors((prev) => ({ ...prev, email: data.error }));
      } else {
        setMessages((prev) => ({ ...prev, email: data.message }));
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, email: "Something went wrong!" }));
    }
  };

  // UPDATE PASSWORD
  const updatePassword = async () => {
    setErrors({ ...errors, password: "", confirmPassword: "", general: "" });
    setMessages({ ...messages, password: "" });

    if (!form.password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }
    if (!form.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Please confirm password" }));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: form.password, confirmPassword: form.confirmPassword }),
      });
      const data = await res.json();

      if (data.error) {
        setErrors((prev) => ({ ...prev, password: data.error }));
      } else {
        setMessages((prev) => ({ ...prev, password: data.message }));
        setForm({ ...form, password: "", confirmPassword: "" });
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, password: "Something went wrong!" }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h2>Profile Management</h2>

        {/* Profile Section */}
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <p className="error">{errors.name}</p>}

        <label>Date of Birth</label>
        <input type="date" name="dob" value={form.dob} onChange={handleChange} />
        {errors.dob && <p className="error">{errors.dob}</p>}

        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && <p className="error">{errors.gender}</p>}

        <button onClick={updateProfile}>Update Profile</button>
        {errors.general && <p className="error">{errors.general}</p>}
        {messages.profile && <p className="success">{messages.profile}</p>}

        <hr />

        {/* Email Section */}
        <h4>Change Email</h4>
        <input
          name="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter new Gmail"
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <button onClick={requestEmailChange}>Verify & Change Email</button>
        {messages.email && <p className="success">{messages.email}</p>}

        <hr />

        {/* Password Section */}
        <h4>Change Password</h4>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}

        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

        <button onClick={updatePassword}>Update Password</button>
        {messages.password && <p className="success">{messages.password}</p>}
      </div>
    </>
  );
}
