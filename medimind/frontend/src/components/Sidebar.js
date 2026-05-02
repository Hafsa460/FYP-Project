import React from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menu = [
    { key: "dashboard", label: "Dashboard" },
    { key: "superAdmins", label: "Super Admins" },
    { key: "doctorAdmins", label: "Doctor Admins" },
    { key: "departmentAdmins", label: "Department Admins" },
    { key: "patientAdmins", label: "Patient Admins" },
  ];

  return (
    <div className="super-sidebar">
      <h2>Super Admin</h2>

      {menu.map((item) => (
        <div
          key={item.key}
          className={`super-nav ${activeTab === item.key ? "active" : ""}`}
          onClick={() => setActiveTab(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}