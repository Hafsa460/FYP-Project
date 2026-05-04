import React from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menu = [
    { key: "dashboard", label: "Dashboard" },
    { key: "superAdmins", label: "Super Admins" },
    { key: "adminManagement", label: "Manage Admins" },
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