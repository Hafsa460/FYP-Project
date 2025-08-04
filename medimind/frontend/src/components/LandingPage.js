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
    {
      id: "neurology",
      name: "Neurology",
      doctors: 8,
      nurses: 12,
      others: 3,
    },
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

      <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
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
        <div
          className="Background d-flex justify-content-center align-items-start"
          style={{ flex: 1, padding: "2rem" }}
        >
          <div
            className="bg-white shadow p-4 rounded"
            style={{
              width: "100%",
              maxWidth: "500px", // You can change this
              minWidth: "280px",
              minHeight: "200px",
              height: "auto", // auto height for content
            }}
          >
            <h4 className="mb-4 text-primary">
              {selectedDept.name} Department
            </h4>
            <p className="mb-2">
              <strong>Doctors:</strong> {selectedDept.doctors}
            </p>
            <p className="mb-2">
              <strong>Nurses:</strong> {selectedDept.nurses}
            </p>
            <p className="mb-0">
              <strong>Other Staff:</strong> {selectedDept.others}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
