// src/components/AdminLogin.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";
export default function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
    const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        id: Number(id.trim()),
        password: password.trim()
      });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminRole", res.data.role);
      localStorage.setItem("adminName", res.data.name);
      if (res.data.role == "doctorAdmin")
      {
        navigate("/dctr")
      }
      else if (res.data.role == "patientAdmin")
      {
        navigate("/patient")
      }
      else if (res.data.role == "departmentAdmin")
      {
        navigate("/department")
      }
      else if (res.data.role == "superAdmin")
      {
        navigate("/super")
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="number"
          placeholder="Enter Admin ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>Login</button>
      </form>
      {message && <p style={{ marginTop: "15px", color: message.includes("Welcome") ? "green" : "red" }}>{message}</p>}
    </div>
  );
}
