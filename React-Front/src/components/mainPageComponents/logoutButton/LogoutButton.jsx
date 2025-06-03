import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton({ setIsLoggin }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8801/manageLogin/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggin(false);
        navigate("/");
      } else {
        alert("Logout failed: " + data.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("An error occurred during logout");
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
