import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    alert("Logged out successfully!");
    navigate("/");
  }, [navigate]);

  return null;
}

export default Logout;
