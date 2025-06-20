import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./logoutButton.module.css"; 

export default function LogoutButton({ setIsLoggin }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8801/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggin(false); // Logout successful
        navigate("/"); // Redirect to home page
      }
    } catch {
      // Silent catch
      console.log("Logout failed");
    }
  };

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      Logout
    </button>
  );
}
