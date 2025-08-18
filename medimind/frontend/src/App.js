import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginDashboard from "../src/components/Dashboard";
import Login from "../src/components/Login";
import LoginPatients from "../src/components/LoginPatients";
import SignUp from "../src/components/SignUp";
import LandingPage from "../src/components/LandingPage";
import NeuroDashboard from "../src/components/Neurologist/NeuroDashboard";
import ManageAppointment from '../src/components/Neurologist/ProfileManagement';
import ViewPrescriptions from '../src/components/Neurologist/PrescriptionHistory';
import TestHistory from '../src/components/Neurologist/VerifyReports';
import ProfileManagement from "../src/components/Neurologist/ProfileManagement";
import PatientDashboard from '../src/components/PatientDashboard';
import Navbar  from "./components/Navbar";
import VerifySuccess from "./components/VerifySuccess";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassowrd";
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
      <Route path="/PatientDashboard" element={<PatientDashboard />} />
      <Route path="/manage-appointment" element={<ManageAppointment />} />
      <Route path="/view-prescriptions" element={<ManageAppointment />} />
      <Route path="/test-history" element={<TestHistory />} />
      <Route path="/profile-management" element={<ProfileManagement />} />
      <Route path="/verify-success" element={<VerifySuccess/>}/>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;

