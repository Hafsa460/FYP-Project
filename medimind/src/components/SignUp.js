import React, { useState } from "react";
import "./Login.css";
import coverimage from "../images/cover.png";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");

  const handleSignUp = () => {
    if (!username || !password || !phoneNumber || !age || !address) {
      alert("Please fill out all fields.");
      return;
    }

    if (!/^(\+92|03)[0-9]{9}$/.test(phoneNumber)) {
      alert("Phone number must start with +92 or 03 and be 11 digits long.");
      return;
    }

    if (isNaN(age) || Number(age) <= 0) {
      alert("Please enter a valid age.");
      return;
    }
    if (password.length <= 6) {
      alert("Please enter a password greater than 6.");
      return;
    }
    console.log("User signed up with: ", {
      username,
      password,
      phoneNumber,
      age,
      address,
    });
    alert("Signed up successfully!");
  };

  return (
    <div className="first">
      <img src={coverimage} alt="Cover" className="new" />
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="tel"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <input
        type="number"
        placeholder="Enter your age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button className="btn" onClick={handleSignUp}>
        Sign Up
      </button>
    </div>
  );
}

export default SignUp;
