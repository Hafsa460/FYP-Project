import React, { useState, useEffect } from "react";
import {
  FileText,
  User,
  Calendar,
  LayoutGrid,
  Search,
  ClipboardList,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
const TestReport = () => {
  const [tests, setTests] = useState([]);
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      navigate("/");
    }

    // 🔹 Dummy data – replace with API call
    setTests([
      {
        id: 1,
        testName: "Blood Test",
        date: "2025-08-12",
        status: "Completed",
        result: "Normal",
      },
      {
        id: 2,
        testName: "X-Ray Chest",
        date: "2025-08-08",
        status: "Pending",
        result: "Awaiting Report",
      },
      {
        id: 3,
        testName: "MRI Brain",
        date: "2025-08-01",
        status: "Completed",
        result: "No abnormalities detected",
      },
    ]);
  }, [navigate]);

  if (!patient) {
    return <div className="p-4">Loading patient data...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <aside
          className="bg-white border-end shadow-sm p-3 d-flex flex-column justify-content-between"
          style={{ width: "250px" }}
        >
          <div>
            <div className="d-flex align-items-center mb-4">
              <User className="me-2 text-primary" size={32} />
              <h1 className="h5 mb-0">{patient.name}</h1>
            </div>
            <h2 className="h6 text-muted mb-3">Dashboard</h2>
            <nav>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link
                    to="/view-prescriptions"
                    className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                  >
                    <FileText className="me-2" size={18} />
                    View Prescriptions
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/test-history"
                    className="d-flex align-items-center p-2 rounded bg-light text-primary text-decoration-none"
                  >
                    <ClipboardList className="me-2" size={18} />
                    Test History
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/profile-management"
                    className="d-flex align-items-center p-2 rounded text-dark text-decoration-none hover-shadow"
                  >
                    Profile Management
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <Link
              to="/"
              className="d-flex align-items-center p-2 rounded text-danger text-decoration-none"
            >
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 p-4">
          <header className="bg-white p-3 rounded shadow-sm d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <LayoutGrid className="me-2 text-muted" size={20} />
              <span className="text-muted">Test History</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="position-relative">
                <Search
                  className="position-absolute top-50 translate-middle-y ms-2 text-muted"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search test record"
                  className="form-control ps-5"
                  style={{ width: "220px" }}
                />
              </div>
            </div>
          </header>

          {/* Test Records */}
          <div className="row g-4">
            {tests.map((test) => (
              <div className="col-md-6" key={test.id}>
                <div className="card shadow-sm p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0 text-primary d-flex align-items-center">
                      <ClipboardList className="me-2" size={20} />
                      {test.testName}
                    </h5>
                    <small className="text-muted d-flex align-items-center">
                      <Calendar className="me-1" size={14} /> {test.date}
                    </small>
                  </div>
                  <p className="mb-1 text-muted">
                    Status:{" "}
                    <strong
                      className={
                        test.status === "Completed"
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {test.status}
                    </strong>
                  </p>
                  <p className="text-muted mb-0">
                    Result: <em>{test.result}</em>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default TestReport;
