import { useState, useEffect } from "react";
import { ClipboardList, FileText, Users, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import "./NeuroDashboard.css";
import maleProfile from "../../images/male.png";
import femaleProfile from "../../images/female.png";

function NeuroDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
    verifiedReports: 0,
    genderStats: { male: 0, female: 0 },
  });

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        if (!token) return;

        const doctorRes = await fetch("http://localhost:5000/api/doctor-auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctorData = await doctorRes.json();
        if (doctorData.success) {
          setDoctor(doctorData.doctor);

          // ✅ fetch doctor stats only after doctor is known
          const statsRes = await fetch(
            `http://localhost:5000/api/doctor-auth/${doctorData.doctor._id}/stats`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
        }
      } catch (err) {
        console.error("Error fetching doctor stats:", err);
      }
    };

    fetchDoctorStats();
  }, []);

  if (!doctor) {
    return <div className="p-4">Loading doctor dashboard...</div>;
  }

  const genderData = [
    { name: "Male", value: stats.genderStats?.male || 0 },
    { name: "Female", value: stats.genderStats?.female || 0 },
  ].filter((item) => item.value > 0);

  const COLORS = ["#3b82f6", "#ec4899"]; // blue = Male, pink = Female

  return (
    <div className="main-content">
      <div className="doctor-card d-flex align-items-center mb-4 p-3 shadow-sm rounded">
        <img
          src={doctor.gender === "male" ? maleProfile : femaleProfile}
          alt="Doctor"
          className="profile-icon me-3"
        />
        <div>
          <div className="fw-bold fs-5">{doctor.name}</div>
          <div className="text-muted">{doctor.designation}</div>
          <div className="text-muted">{doctor.department}</div>
          <div className="text-secondary mt-1">
            {stats.upcomingAppointments} upcoming appointments
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="card-grid mb-4">
        <div className="card">
          <div className="fw-bold">Upcoming Appointments</div>
          <div className="fs-4">{stats.upcomingAppointments}</div>
        </div>
        <div className="card">
          <div className="fw-bold">Patients</div>
          <div className="fs-4">{stats.totalPatients}</div>
        </div>
        <div className="card">
          <div className="fw-bold">Prescriptions Added</div>
          <div className="fs-4">{stats.totalPrescriptions}</div>
        </div>
        <div className="card">
          <div className="fw-bold">Reports Verified</div>
          <div className="fs-4">{stats.verifiedReports}</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid mt-4">
        {/* Gender Pie Chart */}
        <div className="chart-section small-card">
          <div className="section-title">Patient Gender Distribution</div>
          {stats.totalPatients > 0 && genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) =>
                    value > 0 ? `${name} (${value})` : ""
                  }
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No gender data available</p>
          )}
        </div>

        {/* Quick Insights */}
        <div className="chart-section small-card">
          <div className="section-title">
            <div className="block-section flex-grow-1 ms-3">
              <div className="section-title">Quick Insights</div>
              <ul>
                <li>
                  <ClipboardList size={16} className="me-2" />{" "}
                  {stats.totalAppointments} total appointments handled
                </li>
                <li>
                  <Users size={16} className="me-2" /> {stats.totalPatients}{" "}
                  patients treated
                </li>
                <li>
                  <FileText size={16} className="me-2" />{" "}
                  {stats.totalPrescriptions} prescriptions written
                </li>
                <li>
                  <CheckCircle size={16} className="me-2" />{" "}
                  {stats.verifiedReports} reports verified
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NeuroDashboard;
