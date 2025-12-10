import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import coverimage from "../images/cover.png";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./LandingPage.css";

export default function LandingPage() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/departments")
      .then((res) => res.json())
      .then((data) =>
        setDepartments(Array.isArray(data) ? data : data.departments || data)
      )
      .catch((err) => console.error("Departments fetch error:", err));

    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) =>
        setDoctors(Array.isArray(data) ? data : data.doctors || data)
      )
      .catch((err) => console.error("Doctors fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Chart data: doctors per department
  const pieData = departments.map((dept) => {
    const count = doctors.filter((d) => d.department === dept.name).length;
    return { name: dept.name, value: count || 0 };
  });

  // Example bar chart data: patients mock per department (if you have real data replace)
  const barData = departments.map((dept) => {
    const count = doctors.filter((d) => d.department === dept.name).length;
    // use doctors count as proxy for patients here (or replace with real field)
    return { name: dept.name, patients: Math.max(10, count * 20) };
  });

  // Stats - keep original counts and a couple of placeholders
  const stats = {
    doctors: doctors.length,
    departments: departments.length,
    patients: 5000,
    years: 25,
    rooms: 40,
    staff: 120,
    ambulances: 5,
  };

  const PIE_COLORS = [
    "#059da8",
    "#00bfa5",
    "#4dd0e1",
    "#80deea",
    "#26a69a",
    "#00897b",
    "#00695c",
    "#4a148c",
  ];

  return (
    <div className="landing-root font-sans">
      <Navbar />

      {/* HERO */}
      <section
        id="hero"
        className="hero min-h-screen flex flex-col items-center justify-center text-center px-6 relative"
      >
        <div className="hero-inner max-w-5xl w-full">
          <img
            src={coverimage}
            alt="KRL Hospital"
            className="hero-logo w-40 h-40 mx-auto mb-4 rounded-full shadow-lg animate-float"
          />
          <h1 className="hero-title text-5xl md:text-6xl font-bold text-teal-700 mb-3">
            Welcome to KRL Hospital
          </h1>
          <p className="hero-sub text-lg md:text-xl text-gray-700 mb-6">
            Providing quality healthcare with compassion and excellence.
          </p>
          <div className="hero-ctas flex gap-4 justify-center">
            <a href="#departments" className="btn btn-primary">
              View Departments
            </a>
            <a href="#doctors" className="btn btn-secondary">
              Meet Our Doctors
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" aria-hidden>
          <span className="scroll-text">Scroll to explore</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="scroll-arrow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* QUICK STATS ROW */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="stat-value">{stats.doctors}</div>
              <div className="stat-label">Doctors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.departments}</div>
              <div className="stat-label">Departments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.patients}</div>
              <div className="stat-label">Patients Treated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.years}+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-12 md:py-16 bg-teal-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {[
              "Cardiology",
              "Neurology",
              "Orthopedics",
              "Pediatrics",
              "Surgery",
              "Diagnostics",
              "Emergency",
              "Rehabilitation",
            ].map((s) => (
              <div key={s} className="service-card">
                <div className="service-title">{s}</div>
                <div className="service-desc">
                  High-quality {s.toLowerCase()} care and procedures.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARTS */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="section-title">Doctors & Patients Overview</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Doctors per Department</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label={({ name }) =>
                        name.length > 12 ? name.slice(0, 12) + "…" : name
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">Patients (per Dept) — proxy</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#059da8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section id="departments" className="py-12 md:py-16 bg-teal-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="section-title">Our Departments</h2>
          <div className="cards-grid">
            {departments.map((dept) => {
              const doctorCount = doctors.filter((d) => d.department === dept.name).length;
              return (
                <div key={dept._id || dept.name} className="info-card">
                  <div className="info-icon">{dept.name.charAt(0)}</div>
                  <h3 className="info-title">{dept.name}</h3>
                  <p className="info-meta">
                    Doctors: {doctorCount} | Nurses: {dept.nurses || 0}
                  </p>
                  <a href="#doctors" className="btn btn-small btn-primary-sm">
                    View Doctors
                  </a>
                </div>
              );
            })}
            {departments.length === 0 && (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                No departments yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="section-title">Meet Our Doctors</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading doctors...</p>
          ) : (
            <div className="cards-grid">
              {doctors.map((doc) => (
                <div key={doc._id || doc.email || doc.name} className="doctor-card">
                  <div className="doc-avatar">{doc.name.charAt(0)}</div>
                  <h3 className="doc-name">{doc.name}</h3>
                  <p className="doc-role">{doc.designation || "Doctor"}</p>
                  <a href="/login-option" className="btn btn-small btn-primary-sm">
                    Book Appointment
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-12 md:py-16 bg-teal-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="section-title">What Our Patients Say</h2>
          <div className="testimonial-list">
            <blockquote className="testimonial">
              “Amazing care and quick response! Highly recommend.” —{" "}
              <strong>Fatima S.</strong>
            </blockquote>
            <blockquote className="testimonial">
              “The doctors are professional and kind. Great experience.” —{" "}
              <strong>Ahmed R.</strong>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-12 md:py-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="section-title">Contact Us</h2>
          <p className="text-gray-700">KRL Road, Islamabad, Pakistan</p>
          <p className="text-gray-700">Phone: +92 000 00000000</p>
          <p className="text-gray-700">Email: contact@krlhospital.com</p>
          <div className="mt-6 flex justify-center gap-4">
            <a href="tel:+920000000000" className="btn btn-primary">
              Call Now
            </a>
            <a href="mailto:contact@krlhospital.com" className="btn btn-secondary">
              Send Email
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer bg-teal-700 text-white text-center py-6">
        <div className="max-w-6xl mx-auto px-6">
          © {new Date().getFullYear()} KRL Hospital. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
