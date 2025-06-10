import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginDashboard from "./components/Dashboard";
import Login from "./components/Login";
import LoginPatients from "./components/LoginPatients";
import SignUp from "./components/SignUp";
import LandingPage from "./components/LandingPage";
import NeuroDashboard from "./components/Neurologist/NeuroDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dash" replace />} />
      <Route path="/dash" element={<LandingPage />} />
      <Route path="/Login-option" element={<LoginDashboard />} />
      <Route path="/login-doctor" element={<Login />} />
      <Route path="/login-patient" element={<LoginPatients />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/neuro-dashboard/*" element={<NeuroDashboard />} />
    </Routes>
  );
}

export default App;
