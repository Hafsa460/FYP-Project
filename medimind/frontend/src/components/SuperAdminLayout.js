import React, { useState } from "react";
import Sidebar from "./Sidebar";
import SuperAdmin from "./SuperAdmin";
import "./superadmin.css";

export default function SuperAdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="super-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="super-main">
        <SuperAdmin activeTab={activeTab} />
      </div>
    </div>
  );
}