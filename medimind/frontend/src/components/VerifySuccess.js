// src/VerifySuccess.js
import React from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifySuccess() {
  const q = useQuery();
  const mrNo = q.get("mrNo");
  return (
    <div style={{ padding: 24 }}>
      <h2>Account Verified</h2>
      {mrNo ? (
        <p>Your account is verified. Your username (MR No) is <strong>{mrNo}</strong></p>
      ) : (
        <p>Your account is verified. (MR No not provided in URL)</p>
      )}
      <p><a href="/login">Proceed to login</a></p>
    </div>
  );
}
