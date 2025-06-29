import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginDashboard from "./components/Dashboard";
import Login from "./components/Login";
import LoginPatients from "./components/LoginPatients";
import SignUp from "./components/SignUp";
import LandingPage from "./components/LandingPage";
import NeuroDashboard from "./components/Neurologist/NeuroDashboard";
import PatientDashboard from "./components/PatientDashboard";

const ManageAppointment = () => (
  <div className="p-10 text-xl">Manage Appointment Page</div>
);
const ViewPrescriptions = () => (
  <div className="p-10 text-xl">View Prescriptions Page</div>
);
const TestHistory = () => <div className="p-10 text-xl">Test History Page</div>;
const ProfileManagement = () => (
  <div className="p-10 text-xl">Profile Management Page</div>
);

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
      <Route path="/view-prescriptions" element={<ViewPrescriptions />} />
      <Route path="/test-history" element={<TestHistory />} />
      <Route path="/profile-management" element={<ProfileManagement />} />
    </Routes>
  );
}

export default App;

/*LOGIN RESTORED:
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPatients from './components/LoginPatients';
import PatientDashboard from './components/PatientDashboard';

const ManageAppointment = () => <div className="p-10 text-xl">Manage Appointment Page</div>;
const ViewPrescriptions = () => <div className="p-10 text-xl">View Prescriptions Page</div>;
const TestHistory = () => <div className="p-10 text-xl">Test History Page</div>;
const ProfileManagement = () => <div className="p-10 text-xl">Profile Management Page</div>;
const Logout = ({ onLogout }) => {
  onLogout();
  return <Navigate to="/" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedAuthStatus = localStorage.getItem('isLoggedIn');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedAuthStatus === 'true' && storedUserRole === 'patient') {
      setIsAuthenticated(true);
      setUserRole('patient');
    }
  }, []);

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  if (!isAuthenticated || userRole !== 'patient') {
    return <LoginPatients onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<PatientDashboard onLogout={handleLogout} />} />
      <Route path="/manage-appointment" element={<ManageAppointment />} />
      <Route path="/view-prescriptions" element={<ViewPrescriptions />} />
      <Route path="/test-history" element={<TestHistory />} />
      <Route path="/profile-management" element={<ProfileManagement />} />
      <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
 */
