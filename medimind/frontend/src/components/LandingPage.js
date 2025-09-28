import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import Navbar from "./Navbar.js";

function LandingPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/departments")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setDepartments(data);
        if (data.length > 0) setSelectedDept(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setError("Failed to load departments");
        setLoading(false);
      });

    fetch("http://localhost:5000/api/doctors")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch doctors");
        return res.json();
      })
      .then((data) => {
        setDoctors(data);
        setLoadingDoctors(false);
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setLoadingDoctors(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-20">Loading departments...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  const filteredDoctors = selectedDept
    ? doctors.filter((doc) => doc.department === selectedDept.name)
    : [];

  return (
    <div className="font-sans">
      <Navbar />

      {/* Section 1: Hero (Full Screen) */}
<section className="h-screen flex flex-col items-center justify-center bg-[#e0f7fa] text-center shadow-md">
  <h1 className="text-5xl font-bold text-[#00695c]">
    Welcome to KRL Hospital
  </h1>
  <p className="text-lg mt-4 text-gray-700">
    Providing quality healthcare with compassion and excellence.
  </p>
  <div className="mt-6 flex gap-4">
    {/* Scroll to Departments */}
    <a href="#departments" className="btn-primary">
      View Departments
    </a>
    {/* Scroll to Contact */}
    <a href="#final-section" className="btn-secondary">
      Contact Us
    </a>
  </div>
</section>


      {/* Section 2: Departments + Doctors (Full Screen) */}
      <section id="departments" className="h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-[260px] bg-gray-100 p-6 border-r border-gray-300 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Departments</h3>
          <ul className="space-y-2">
            {departments.map((dept) => (
              <li
                key={dept._id}
                onClick={() => setSelectedDept(dept)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  dept._id === selectedDept?._id
                    ? "bg-teal-500 text-white font-bold shadow-md"
                    : "hover:bg-teal-100"
                }`}
              >
                {dept.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Department Info */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h4 className="text-2xl font-semibold text-teal-600 mb-6 text-center">
              {selectedDept?.name} Department
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <strong>Doctors</strong>
                <p className="text-xl font-bold">{selectedDept?.doctors || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <strong>Nurses</strong>
                <p className="text-xl font-bold">{selectedDept?.nurses || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <strong>Other Staff</strong>
                <p className="text-xl font-bold">{selectedDept?.others || 0}</p>
              </div>
            </div>
          </div>

          {/* Doctors */}
          <section className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h4 className="text-2xl font-semibold text-teal-600 mb-6 text-center">
              Meet Our Doctors
            </h4>

            {loadingDoctors ? (
              <p className="text-center text-gray-500">Loading doctors...</p>
            ) : filteredDoctors.length === 0 ? (
              <p className="text-center text-gray-500">
                No doctors available for this department
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-6 bg-gray-50 rounded-lg shadow-md text-center"
                  >
                    <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl">
                      {doc.name.charAt(0)}
                    </div>
                    <h5 className="mt-4 text-lg font-bold text-gray-800">
                      {doc.name}
                    </h5>
                    {doc.designation && (
                      <p className="text-sm text-gray-600">{doc.designation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </section>

      {/* Section 3: Final Section (Testimonials + Contact + Footer) */}
      <section id="final-section" className="h-screen flex flex-col justify-between bg-gray-50">
        {/* Testimonials */}
        <div className="py-8 px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            What Our Patients Say
          </h2>
          <div className="space-y-6 text-lg text-gray-700 max-w-3xl mx-auto">
            <p className="testimonial-card p-6">
              “Amazing care and quick response! Highly recommend.” –{" "}
              <strong>Fatima S.</strong>
            </p>
            <p className="testimonial-card p-6">
              “The doctors are professional and kind. Great experience.” –{" "}
              <strong>Ahmed R.</strong>
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="py-8 px-6 text-center contact-card">
          <h2 className="text-2xl font-bold mb-6" style={{color: '#00695c'}}>Contact Us</h2>
          <p>
            <strong>Address:</strong> KRL Road, Islamabad, Pakistan
          </p>
          <p>
            <strong>Phone:</strong> +92 000 00000000
          </p>
          <p>
            <strong>Email:</strong> contact@krlhospital.com
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a href="tel:+920000000000" className="btn-primary">
              Call Now
            </a>
            <a href="mailto:contact@krlhospital.com" className="btn-secondary">
              Send Email
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-teal-500 text-white text-center py-4">
          © 2025 KRL Hospital. All rights reserved.
        </footer>
      </section>
    </div>
  );
}

export default LandingPage;
