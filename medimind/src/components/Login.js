import React, { useState } from 'react';
import './Login.css'; 
import coverimage from '../images/cover.png'

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const validateLogin = () => {
    if (username === 'hafsa13' && password === 'hafsa') {
      window.location.href = '../main/main.html';
    } else {
      alert('Incorrect username or password!');
    }
  };

  return (
    <div className="first">
      <img src={coverimage} alt="Cover" className="new" />
      <input
        type="text"
        id="username"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        id="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn" onClick={validateLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;
