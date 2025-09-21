import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginDashboard from "./components/Dashboard";
import Login from "./components/Login";
import LoginPatients from "./components/LoginPatients";
import SignUp from "./components/SignUp";
import LandingPage from "./components/LandingPage";
import NeuroLayout from "./components/Neurologist/NeuroLayout"; // ✅ shared layout
import NeuroDashboard from "./components/Neurologist/NeuroDashboard";
import ManageAppointment from "./components/Neurologist/ProfileManagement";
import PrescriptionHistory from "./components/Neurologist/PrescriptionHistory";
import TestHistory from "./components/Neurologist/VerifyReports";
import TestReport from "./components/TestReport";
import ProfileManagement from "./components/Neurologist/ProfileManagement";
import PatientDashboard from "./components/PatientDashboard";
import Appointment from "./components/Appointments";
import VerifySuccess from "./components/VerifySuccess";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassowrd";
import AdminDashboard from "./components/PatientAdmin/AdminPage";
import AdminLogin from "./components/AdminLogin";
import Doctoradmin from "./components/DoctorAdmin";
import Dptadmin from "./components/DptAdmin";
import Superadmin from "./components/SuperAdmin";
import ViewPrescription from "./components/Neurologist/ViewPrescription";
import AddPrescription from "./components/Neurologist/AddPrescription";

// ✅ Protect doctor dashboard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("doctorToken");
  return token ? children : <Navigate to="/login-doctor" replace />;
}

function App() {
  return (
    <Routes>
      {/* Default landing */}
      <Route path="/" element={<Navigate to="/dash" replace />} />
      <Route path="/dash" element={<LandingPage />} />

      {/* Auth routes */}
      <Route path="/Login-option" element={<LoginDashboard />} />
      <Route path="/login-doctor" element={<Login />} />
      <Route path="/login-patient" element={<LoginPatients />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Doctor dashboard with nested routes (protected) */}
      <Route
        path="/neuro-dashboard"
        element={
          <ProtectedRoute>
            <NeuroLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NeuroDashboard />} /> {/* dashboard home */}
        <Route path="verify-reports" element={<TestHistory />} />
        <Route path="add" element={<AddPrescription />} />
        <Route path="view" element={<ViewPrescription />} />
        <Route path="profile-management" element={<ProfileManagement />} />
      </Route>

      {/* Patient & Admin */}
      <Route path="/PatientDashboard" element={<PatientDashboard />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/manage-appointment" element={<ManageAppointment />} />
      <Route path="/view-prescriptions" element={<PrescriptionHistory />} />
      <Route path="/test-history" element={<TestHistory />} />
      <Route path="/profile-management" element={<ProfileManagement />} />
      <Route path="/verify-success" element={<VerifySuccess />} />
      <Route path="/testreport" element={<TestReport />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Admin dashboards */}
      <Route path="/PatientAdmin/*" element={<AdminDashboard />} />
      <Route path="/adminLogin" element={<AdminLogin />} />
      <Route path="/dctr" element={<Doctoradmin />} />
      <Route path="/super" element={<Superadmin />} />
      <Route path="/department" element={<Dptadmin />} />
    </Routes>
  );
}

export default App;
