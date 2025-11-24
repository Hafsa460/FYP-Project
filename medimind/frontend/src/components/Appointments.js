import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import "./Appointment.css";
function Appointment() {
  const [doctors, setDoctors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: null,
    time: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch doctors list
  // 🔹 Fetch doctors list
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctors");
      const data = await res.json();
      console.log("Doctors API response:", data);

      // handle both cases: array OR {success, doctors}
      if (Array.isArray(data)) {
        setDoctors(data);
      } else if (data.success && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };
  fetchDoctors();
}, []);


  // 🔹 Fetch booked slots for selected doctor & date
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
        console.log("Appointments API response:", data);

        setBookedSlots(Array.isArray(data) ? data.map((a) => a.time) : []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, [formData.doctorId, formData.date]);

  // 🔹 Submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.date || !formData.time) {
      setMessage("Please fill all fields.");
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
        setTimeout(() => navigate("/appointment"), 1500);
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
    let [sh] = start.split(":").map(Number);
    let [eh] = end.split(":").map(Number);

    for (let h = sh; h < eh; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
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
                  dayClassName={(date) => {
                    if (
                      selectedDoctor &&
                      Array.isArray(selectedDoctor.leaveDays) &&
                      selectedDoctor.leaveDays.some(
                        (leave) => leave.date === format(date, "yyyy-MM-dd")
                      )
                    ) {
                      return "leave-day";
                    }
                    return undefined;
                  }}
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
                  {generateTimeSlots(
                    selectedDoctor?.workingHours?.start || "08:00",
                    selectedDoctor?.workingHours?.end || "14:00"
                  ).map((t, idx) => {
                    const isBooked = bookedSlots.includes(t);
                    return (
                      <option
                        key={idx}
                        value={isBooked ? "" : t}
                        disabled={isBooked}
                        style={{ color: isBooked ? "red" : "black" }}
                      >
                        {isBooked ? `${t} (Booked)` : t}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button type="submit" className="btn w-100">
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
