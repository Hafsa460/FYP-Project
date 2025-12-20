import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/adminpatient/set-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (data.message) {
        navigate("/login-patient");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <div>
      <h2>Set Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={submit}>Set Password</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
