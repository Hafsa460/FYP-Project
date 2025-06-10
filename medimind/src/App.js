// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginDashboard from "./components/Dashboard";
import Login from "./components/Login";
import LoginPatients from "./components/LoginPatients";
import SignUp from "./components/SignUp";
import NeuroDashboard from "./components/Neurologist/NeuroDashboard"; // <-- Import this

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginDashboard />} />
      <Route path="/login-doctor" element={<Login />} />
      <Route path="/login-patient" element={<LoginPatients />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/neuro-dashboard" element={<NeuroDashboard />} /> {/* <-- Add this */}
    </Routes>
  );
}

export default App;
