import React, { useState } from "react";
import "./Login.css";
import Navbar from "./Navbar.js";

function App() {
  const departments = [
    {
      id: "cardiology",
      name: "Cardiology",
      doctors: 10,
      nurses: 15,
      others: 5,
    },
    { id: "neurology", name: "Neurology", doctors: 8, nurses: 12, others: 3 },
    {
      id: "orthopedics",
      name: "Orthopedics",
      doctors: 6,
      nurses: 10,
      others: 4,
    },
  ];

  const [selectedDept, setSelectedDept] = useState(departments[0]);

  return (
    <div className="font-sans">
      <Navbar />

      <div className="bg-[#e0f7fa] py-12 text-center">
        <h1 className="text-4xl font-bold text-[#00695c]">
          Welcome to KRL Hospital
        </h1>
        <p className="text-lg mt-4">
          Providing quality healthcare with compassion and excellence.
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-[250px] bg-gray-100 p-6 border-r border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Departments</h3>
          <ul className="space-y-2">
            {departments.map((dept) => (
              <li
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className={`p-2 rounded cursor-pointer ${
                  dept.id === selectedDept.id
                    ? "bg-teal-500 text-white font-bold"
                    : "hover:bg-teal-100"
                }`}
              >
                {dept.name}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-6 space-y-12">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <h4 className="text-xl font-semibold text-teal-600 mb-4">
              {selectedDept.name} Department
            </h4>
            <p>
              <strong>Doctors:</strong> {selectedDept.doctors}
            </p>
            <p>
              <strong>Nurses:</strong> {selectedDept.nurses}
            </p>
            <p>
              <strong>Other Staff:</strong> {selectedDept.others}
            </p>
          </div>

          <section className="bg-gray-50 py-12 px-4 md:px-12">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Hospital Analytics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <h4 className="text-lg font-semibold text-teal-600 mb-2">
                    Total Patients
                  </h4>
                  <p className="text-3xl font-bold text-gray-900">2,000</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <h4 className="text-lg font-semibold text-teal-600 mb-2">
                    Appointments This Week
                  </h4>
                  <p className="text-3xl font-bold text-gray-900">300</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <h4 className="text-lg font-semibold text-teal-600 mb-2">
                    Emergency Cases
                  </h4>
                  <p className="text-3xl font-bold text-gray-900">45</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#e0f7fa] py-12 px-4 md:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                What Our Patients Say
              </h2>
              <div className="space-y-6 text-lg text-gray-700">
                <p className="bg-white rounded-lg shadow p-4 max-w-xl mx-auto">
                  “Amazing care and quick response! Highly recommend.” –{" "}
                  <strong>Fatima S.</strong>
                </p>
                <p className="bg-white rounded-lg shadow p-4 max-w-xl mx-auto">
                  “The doctors are professional and kind. Great experience.” –{" "}
                  <strong>Ahmed R.</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-100 py-12 px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>
              <strong>Address:</strong> KRL Road, Islamabad, Pakistan
            </p>
            <p>
              <strong>Phone:</strong> +92 000 00000000
            </p>
            <p>
              <strong>Email:</strong> contact@krlhospital.com
            </p>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-teal-500 text-white text-center py-4">
        © 2025 KRL Hospital. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
