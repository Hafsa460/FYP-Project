import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth & Landing
import LoginDashboard from "./components/Dashboard";
import Login from "./components/Login";
import LoginPatients from "./components/LoginPatients";
import SignUp from "./components/SignUp";
import LandingPage from "./components/LandingPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassowrd";

// Doctor (Neurologist) side
import NeuroLayout from "./components/Neurologist/NeuroLayout";
import AppointmentSchedule from "./components/Neurologist/AppointmentSchedule";
import VerifyReports from "./components/Neurologist/VerifyReports";
import AddPrescription from "./components/Neurologist/AddPrescription";
import ViewPrescription from "./components/Neurologist/ViewPrescription";
import ProfileManagement from "./components/Neurologist/ProfileManagement";
import NeuroDashboard from "./components/Neurologist/NeuroDashboard";

// Patient side
import PatientDashboard from "./components/PatientDashboard";
import Appointment from "./components/Appointments";
import TestReport from "./components/TestReport";
import ViewPrescriptionPatient from "./components/ViewPrescriptionPatient";
import VerifySuccess from "./components/VerifySuccess";
import PrescriptionDetails from "./components/PrescriptionDetails";

// Admins
import AdminDashboard from "./components/PatientAdmin/AdminPage";
import AdminLogin from "./components/AdminLogin";
import Doctoradmin from "./components/DoctorAdmin";
import Dptadmin from "./components/DptAdmin";
import Superadmin from "./components/SuperAdmin";

// Doctor Admin Dashboard pages
import DoctorAdminLayout from "./components/DoctorAdmin/DoctorAdminLayout";
import DoctorAdminDashboard from "./components/DoctorAdmin/DoctorAdminDashboard";
import DoctorDetails from "./components/DoctorAdmin/DoctorDetails";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/dash" replace />} />
      <Route path="/dash" element={<LandingPage />} />

      {/* Login & Signup */}
      <Route path="/Login-option" element={<LoginDashboard />} />
      <Route path="/login-doctor" element={<Login />} />
      <Route path="/login-patient" element={<LoginPatients />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Forgot/Reset Password */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Neurologist Layout */}
      <Route path="/neuro-dashboard" element={<NeuroLayout />}>
        <Route index element={<NeuroDashboard />} />
        <Route path="appointment-schedule" element={<AppointmentSchedule />} />
        <Route path="verify-reports" element={<VerifyReports />} />
        <Route path="add" element={<AddPrescription />} />
        <Route path="view" element={<ViewPrescription />} />
        <Route path="profile-management" element={<ProfileManagement />} />
      </Route>

      {/* Patient */}
      <Route path="/PatientDashboard" element={<PatientDashboard />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/view-prescriptionspatient" element={<ViewPrescriptionPatient />} />
      <Route path="/prescription/:id" element={<PrescriptionDetails />} />
      <Route path="/testreport" element={<TestReport />} />
      <Route path="/verify-success" element={<VerifySuccess />} />

      {/* Admin */}
      <Route path="/adminLogin" element={<AdminLogin />} />
      <Route path="/PatientAdmin/*" element={<AdminDashboard />} />
      <Route path="/department" element={<Dptadmin />} />
      <Route path="/super" element={<Superadmin />} />
      <Route path="/dctr" element={<Doctoradmin />} />

      {/* Doctor Admin */}
      <Route path="/doctor-admin" element={<DoctorAdminLayout />}>
        <Route index element={<DoctorAdminDashboard />} />

        {/* Manage Doctors goes to Dashboard list */}
        <Route path="manage" element={<DoctorAdminDashboard />} />

        {/* Doctor Details page */}
        <Route path="doctor/:id" element={<DoctorDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
