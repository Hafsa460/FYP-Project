import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import coverimage from "../images/cover.png";
import "./LandingPage.css";

function LandingPage() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch departments
    fetch("http://localhost:5000/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error(err));

    // Fetch doctors
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : data.doctors || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="font-sans">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="h-screen flex flex-col items-center justify-center bg-teal-50 text-center"
      >
        <img src={coverimage} alt="KRL Hospital" className="w-40 h-40 mb-4" />
        <h1 className="text-5xl font-bold text-teal-700 mb-4">
          Welcome to KRL Hospital
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Providing quality healthcare with compassion and excellence.
        </p>
        <div className="flex gap-4">
          <a href="#departments" className="btn-primary">
            View Departments
          </a>
          <a href="#doctors" className="btn-secondary">
            Meet Our Doctors
          </a>
        </div>
      </section>

      {/* Departments Section */}
<section id="departments" className="py-16 bg-white">
  <h2 className="text-3xl font-bold text-center text-teal-700 mb-10">
    Our Departments
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6">
    {departments.map((dept) => {
      // Count doctors in this department
      const doctorCount = doctors.filter(doc => doc.department === dept.name).length;

      return (
        <div
          key={dept._id}
          className="p-6 bg-teal-50 rounded-xl shadow-lg text-center hover:shadow-xl transition"
        >
          <h3 className="text-xl font-semibold text-teal-800 mb-2">
            {dept.name}
          </h3>
          <p className="text-gray-700 mb-4">
            Doctors: {doctorCount} | Nurses: {dept.nurses || 0}
          </p>
          <a href="#doctors" className="btn-primary">
            View Doctors
          </a>
        </div>
      );
    })}
  </div>
</section>


      {/* Doctors Section */}
      <section id="doctors" className="py-16 bg-teal-50">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-10">
          Meet Our Doctors
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading doctors...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="p-6 bg-white rounded-xl shadow-lg text-center hover:shadow-xl transition"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl">
                  {doc.name.charAt(0)}
                </div>
                <h3 className="mt-4 text-lg font-bold">{doc.name}</h3>
                <p className="text-gray-600">{doc.designation || "Doctor"}</p>
                <a href="/login-option" className="mt-2 btn-secondary inline-block">
                  Book Appointment
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-10">
          What Our Patients Say
        </h2>
        <div className="max-w-4xl mx-auto space-y-6 px-6">
          <p className="testimonial-card p-6 bg-teal-50 rounded-xl shadow-md">
            “Amazing care and quick response! Highly recommend.” –{" "}
            <strong>Fatima S.</strong>
          </p>
          <p className="testimonial-card p-6 bg-teal-50 rounded-xl shadow-md">
            “The doctors are professional and kind. Great experience.” –{" "}
            <strong>Ahmed R.</strong>
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-teal-100 text-center">
        <h2 className="text-3xl font-bold text-teal-700 mb-6">Contact Us</h2>
        <p>KRL Road, Islamabad, Pakistan</p>
        <p>Phone: +92 000 00000000</p>
        <p>Email: contact@krlhospital.com</p>
        <div className="mt-6 flex justify-center gap-4">
          <a href="tel:+920000000000" className="btn-primary">
            Call Now
          </a>
          <a href="mailto:contact@krlhospital.com" className="btn-secondary">
            Send Email
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-700 text-white text-center py-4">
        © 2025 KRL Hospital. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
