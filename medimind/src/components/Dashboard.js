import React, { useState } from 'react';
import Login_patients from './Login_patients.js';
import Login from './Login.js';
import './Dashboard.css';

function Dashboard() {
  const [view, setView] = useState('dashboard');

  const renderView = () => {
    switch (view) {
      case 'patient':
        return <Login_patients />;
      case 'doctor':
        return <Login />;
      default:
        return (
          <div className="navbar">
            <div className="nav-content">
              <div className="dropdown">
                <button className="dropbtn">Portal</button>
                <div className="dropdown-content">
                  <button onClick={() => setView('patient')}>Login as Patient</button>
                  <button onClick={() => setView('doctor')}>Login as Doctor</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return <div>{renderView()}</div>;
}

export default Dashboard;
