import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

function Appointment() {
  const [doctors, setDoctors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // NEW: store appointments from backend
  const [formData, setFormData] = useState({
    doctorId: "",
    date: null,
    time: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // 🔹 Fetch booked slots when doctor or date changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!formData.doctorId || !formData.date) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/appointments?doctorId=${
            formData.doctorId
          }&date=${format(formData.date, "yyyy-MM-dd")}`
        );
        const data = await res.json();
        setBookedSlots(data.map((a) => a.time)); // store only booked times
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, [formData.doctorId, formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.date || !formData.time) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      ...formData,
      date: format(formData.date, "yyyy-MM-dd"),
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Appointment booked successfully!");
        setTimeout(() => navigate("/patient-dashboard"), 1500);
      } else {
        setMessage(result.error || "Failed to book appointment.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error, please try again later.");
    }
  };

  const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);

  // 🔹 Filter out leave days
  const filterDate = (date) => {
    if (!selectedDoctor || !Array.isArray(selectedDoctor.leaveDays))
      return true;

    const formattedDate = format(date, "yyyy-MM-dd");
    return !selectedDoctor.leaveDays.some(
      (leave) => leave.date === formattedDate
    );
  };

  // 🔹 Generate slots (from working hours or default 8–2)
  const generateTimeSlots = (start = "08:00", end = "14:00") => {
    const slots = [];
    let [sh, sm] = start.split(":").map(Number);
    let [eh, em] = end.split(":").map(Number);

    for (let h = sh; h < eh; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  };

  // 🔹 Available times = working hours – booked slots
  const availableTimes = () => {
    if (!selectedDoctor || !formData.date) return [];

    const { workingHours } = selectedDoctor;
    let slots = generateTimeSlots(
      workingHours?.start || "08:00",
      workingHours?.end || "14:00"
    );

    return slots.filter((slot) => !bookedSlots.includes(slot));
  };

  return (
    <>
      <Navbar />
      <div className="neuro-dashboard d-flex">
        <div className="content p-4 flex-grow-1">
          <div className="main-content">
            <div className="top-section mb-4 d-flex align-items-center">
              <Calendar className="me-3 text-primary" size={40} />
              <div>
                <div className="fw-bold">Book an Appointment</div>
                <div className="text-muted">Choose doctor, date & time</div>
              </div>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              {/* Doctor Select */}
              <div className="mb-3">
                <label className="form-label">Select Doctor</label>
                <select
                  className="form-select"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      doctorId: e.target.value,
                      date: null,
                      time: "",
                    })
                  }
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div className="mb-3">
                <label className="form-label">Select Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) =>
                    setFormData({ ...formData, date, time: "" })
                  }
                  filterDate={filterDate}
                  minDate={new Date()}
                  placeholderText="Pick a date"
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              {/* Time Select */}
              <div className="mb-3">
                <label className="form-label">Select Time</label>
                <select
                  className="form-select"
                  name="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  disabled={!formData.date}
                >
                  <option value="">-- Choose Time --</option>
                  {availableTimes().map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Appointment;
