// src/components/DoctorVerifySuccess.js
import React from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function DoctorVerifySuccess() {
  const q = useQuery();
  const pno = q.get("pno");
  return (
    <div style={{ padding: 24 }}>
      <h2>Doctor Account Verified</h2>
      {pno ? (
        <p>Your account is verified. Your PNO is <strong>{pno}</strong></p>
      ) : (
        <p>Your account is verified. (PNO not provided in URL)</p>
      )}
      <p><a href="/login-doctor">Proceed to login</a></p>
    </div>
  );
}