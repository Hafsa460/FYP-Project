import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dash");
  }, [navigate]);

  return null;
}

export default Logout;
