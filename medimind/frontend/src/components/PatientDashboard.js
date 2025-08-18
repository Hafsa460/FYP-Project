import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  User,
  Users,
  SunMoon,
  ChevronDown,
  Star,
  X,
} from "lucide-react";
import Navbar from "./Navbar";

function PatientDashboard({ onLogout }) {
  const [showNotificationsSidebar, setShowNotificationsSidebar] =
    useState(false);
  const [patient, setPatient] = useState(null); // ✅ Store patient info
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Load patient data from localStorage
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      // If no patient is found, redirect to login
      navigate("/");
    }
  }, [navigate]);

  const toggleNotificationsSidebar = () => {
    setShowNotificationsSidebar(!showNotificationsSidebar);
  };

  if (!patient) {
    return <div className="p-6">Loading patient data...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-[#76ced4] font-inter relative">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between z-20">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <User className="w-8 h-8 text-[#059da8]" />
              <h1 className="text-xl font-semibold text-gray-800">
                {patient.name}
              </h1>
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-4">Dashboard</h2>
            <nav>
              <ul>
                <li className="mb-3">
                  <Link
                    to="/manage-appointment"
                    className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-[#e6f9ff] hover:text-[#059da8] transition-colors duration-200"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    Manage Appointment
                  </Link>
                </li>
                <li className="mb-3">
                  <Link
                    to="/view-prescriptions"
                    className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-[#e6f9ff] hover:text-[#059da8] transition-colors duration-200"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    View Prescriptions
                  </Link>
                </li>
                <li className="mb-3">
                  <Link
                    to="/test-history"
                    className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-[#e6f9ff] hover:text-[#059da8] transition-colors duration-200"
                  >
                    <ClipboardList className="w-5 h-5 mr-3" />
                    Test History
                  </Link>
                </li>
                <li className="mb-3">
                  <Link
                    to="/profile-management"
                    className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-[#e6f9ff] hover:text-[#059da8] transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile Management
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <Link
              to="/"
              className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-[#e6f9ff] hover:text-red-600 transition-colors duration-200 mt-8"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Dashboard */}
        <main className="flex-1 p-8">
          <header className="bg-white p-4 rounded-xl shadow-md mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-5 h-5 text-gray-600" />
              <Star className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">Dashboards / Default</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059da8]"
                />
              </div>
              <SunMoon className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#059da8]" />
              <Settings className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#059da8]" />
              <LayoutGrid className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#059da8]" />
              <div
                className="flex items-center space-x-1 cursor-pointer hover:text-[#059da8] border-l border-gray-200 pl-4"
                onClick={toggleNotificationsSidebar}
              >
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Notifications</span>
              </div>
            </div>
          </header>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex justify-between items-center">
            Dashboard
            <div className="flex items-center space-x-2 text-base font-normal text-gray-600">
              Today <ChevronDown className="w-4 h-4 ml-1" />
            </div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="bg-[#e0f7fa] p-4 rounded-xl mr-6 flex-shrink-0">
                <Users className="w-16 h-16 text-[#059da8]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {patient.name}
                </h3>
                <p className="text-gray-600 mb-1">
                  Age: <span className="font-medium">{patient.age}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Gender: <span className="font-medium">{patient.gender}</span>
                </p>
                <p className="text-gray-600">
                  Blood Group:{" "}
                  <span className="font-medium">{patient.bloodGroup}</span>
                </p>
              </div>
            </div>

            {/* Other widgets */}
            <div className="md:col-span-1"></div>

            <div
              onClick={() => navigate("/manage-appointment")}
              className="cursor-pointer bg-white rounded-xl shadow-md p-6 flex flex-col items-start justify-center hover:bg-gray-100 transition"
            >
              <Users className="w-8 h-8 text-[#059da8] mb-3" />
              <p className="text-gray-600 text-lg mb-2">Appointment today</p>
              <span className="text-3xl font-bold text-gray-900">1</span>
            </div>

            <div
              onClick={() => navigate("/test-history")}
              className="cursor-pointer bg-white rounded-xl shadow-md p-6 flex flex-col items-start justify-center hover:bg-gray-100 transition"
            >
              <FileText className="w-8 h-8 text-[#059da8] mb-3" />
              <p className="text-gray-600 text-lg mb-2">Total Tests Done</p>
              <span className="text-3xl font-bold text-gray-900">2,318</span>
            </div>

            <div
              onClick={() => navigate("/view-prescriptions")}
              className="cursor-pointer bg-white rounded-xl shadow-md p-6 flex flex-col items-start justify-center hover:bg-gray-100 transition"
            >
              <ClipboardList className="w-8 h-8 text-[#059da8] mb-3" />
              <p className="text-gray-600 text-lg mb-2">Pending Tests</p>
              <span className="text-3xl font-bold text-gray-900">10</span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default PatientDashboard;
