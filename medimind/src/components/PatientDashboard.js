import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  History,
  Home,
  LogOut,
  Search,
  Settings,
  User,
  Users,
  SunMoon,
  LayoutGrid,
  ChevronDown,
  Star,
  X,
} from "lucide-react";
import Navbar from "./Navbar";

function PatientDashboard({ onLogout }) {
  const [showNotificationsSidebar, setShowNotificationsSidebar] =
    useState(false);
  const navigate = useNavigate();

  const toggleNotificationsSidebar = () => {
    setShowNotificationsSidebar(!showNotificationsSidebar);
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-[#76ced4] font-inter relative">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg  p-6 flex flex-col justify-between z-20">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <User className="w-8 h-8 text-[#059da8]" />
              <h1 className="text-xl font-semibold text-gray-800">
                Patient's name
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
              to="/logout"
              className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-[#e6f9ff] hover:text-red-600 transition-colors duration-200 mt-8"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Content */}
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

          {/* Dashboard Content */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex justify-between items-center">
            Dashboard
            <div className="flex items-center space-x-2 text-base font-normal text-gray-600">
              Today <ChevronDown className="w-4 h-4 ml-1" />
            </div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="bg-[#e0f7fa] p-4 rounded-xl mr-6 flex-shrink-0">
                <Users className="w-16 h-16 text-[#059da8]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  patient's name
                </h3>
                <p className="text-gray-600 mb-1">
                  Age: <span className="font-medium">25</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Gender: <span className="font-medium">Female</span>
                </p>
                <p className="text-gray-600">
                  Blood Group: <span className="font-medium">O+</span>
                </p>
              </div>
            </div>

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

        {/* Notifications Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full bg-white shadow-xl w-80 md:w-96 p-6 z-50 transform transition-transform duration-300 ease-in-out ${
            showNotificationsSidebar ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Notifications
            </h3>
            <button
              onClick={toggleNotificationsSidebar}
              className="text-gray-500 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-800">
                New appointment booked!
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-800">
                Your lab results are ready.
              </p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-800">
                Reminder: appointment tomorrow at 10 AM.
              </p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>

        {showNotificationsSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleNotificationsSidebar}
          ></div>
        )}
      </div>
    </>
  );
}

export default PatientDashboard;
