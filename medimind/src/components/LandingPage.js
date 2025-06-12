import React, { useState } from "react";
import "./Login.css";
import Navbar from "./Navbar.js";

function App() {
  const departments = [
    {
      id: "cardiology",
      name: "Cardiology",
      doctors: 10,
      nurses: 15,
      others: 5,
    },
    { id: "neurology", name: "Neurology", doctors: 8, nurses: 12, others: 3 },
    {
      id: "orthopedics",
      name: "Orthopedics",
      doctors: 6,
      nurses: 10,
      others: 4,
    },
  ];
  const [selectedDept, setSelectedDept] = useState(departments[0]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <div
        style={{
          backgroundColor: "#e0f7fa",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", color: "#00695c" }}>
          Welcome to KRL Hospital
        </h1>
        <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
          Providing quality healthcare with compassion and excellence.
        </p>
      </div>

      {/* Main Section */}
      <div style={{ display: "flex", height: "auto" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "250px",
            backgroundColor: "#f0f0f0",
            padding: "1rem",
            borderRight: "1px solid #ccc",
          }}
        >
          <h3>Departments</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {departments.map((dept) => (
              <li
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor:
                    dept.id === selectedDept.id ? "#00b3b3" : "transparent",
                  color: dept.id === selectedDept.id ? "white" : "black",
                  fontWeight: dept.id === selectedDept.id ? "bold" : "normal",
                }}
              >
                {dept.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div
          className="Background d-flex flex-column align-items-center"
          style={{ flex: 1, padding: "2rem", gap: "2rem" }}
        >
          {/* Department Details Box */}
          <div
            className="bg-white shadow p-4 rounded"
            style={{
              width: "100%",
              maxWidth: "600px",
              minHeight: "200px",
              border: "1px solid #ddd",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <h4 className="mb-4 text-teal">{selectedDept.name} Department</h4>
            <p>
              <strong>Doctors:</strong> {selectedDept.doctors}
            </p>
            <p>
              <strong>Nurses:</strong> {selectedDept.nurses}
            </p>
            <p>
              <strong>Other Staff:</strong> {selectedDept.others}
            </p>
          </div>

          {/* Analytics Box */}
          <div
            className="bg-white shadow p-4 rounded"
            style={{
              width: "100%",
              maxWidth: "600px",
              minHeight: "200px",
              border: "1px solid #ddd",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <h4 className="mb-4 text-teal">Analytics</h4>
            <p>
              <strong>Total Patients:</strong> 2000
            </p>
            <p>
              <strong>Appointments This Week:</strong> 300
            </p>
            <p>
              <strong>Emergency Cases:</strong> 45
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: "3rem", backgroundColor: "#e8f5e9" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
          What Our Patients Say
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <p>
            "Amazing care and quick response! Highly recommend." – Fatima S.
          </p>
          <p>
            "The doctors are professional and kind. Great experience." – Ahmed
            R.
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div style={{ padding: "3rem", backgroundColor: "#fafafa" }}>
        <h2>Contact Us</h2>
        <p>
          <strong>Address:</strong> KRL Road, Islamabad, Pakistan
        </p>
        <p>
          <strong>Phone:</strong> +92 000 00000000
        </p>
        <p>
          <strong>Email:</strong> contact@krlhospital.com
        </p>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: "1rem",
          backgroundColor: "#00b3b3",
          color: "white",
          textAlign: "center",
        }}
      >
        © 2025 KRL Hospital. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
