// src/components/NeuroDashboard.js
import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import "./NeuroDashboard.css";

import VerifyReports from "./VerifyReports";
import PrescriptionHistory from "./PrescriptionHistory";
import ProfileManagement from "./ProfileManagement";
import Logout from "./Logout";

function NeuroDashboard() {
  return (
    <div className="neuro-dashboard d-flex">
      {/* Sidebar */}
      <div className="sidebar p-3">
        <h4 className="text-white text-center mb-4">Neuro Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="verify-reports" className="nav-link text-white">
              Verify Test Reports
            </Link>
          </li>
          <li className="nav-item">
            <Link to="prescription-history" className="nav-link text-white">
              View Prescription History
            </Link>
          </li>
          <li className="nav-item">
            <Link to="profile-management" className="nav-link text-white">
              Profile Management
            </Link>
          </li>
          <li className="nav-item">
            <Link to="logout" className="nav-link text-white">
              Logout
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content p-4 flex-grow-1">
        <Routes>
          <Route path="verify-reports" element={<VerifyReports />} />
          <Route path="prescription-history" element={<PrescriptionHistory />} />
          <Route path="profile-management" element={<ProfileManagement />} />
          <Route path="logout" element={<Logout />} />
        </Routes>
      </div>
    </div>
  );
}

export default NeuroDashboard;
