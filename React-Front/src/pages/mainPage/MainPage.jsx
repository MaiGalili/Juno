import React, { useEffect, useState } from "react";
import classes from "./mainPage.module.css";
import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";
import TaskPanel from "../../components/mainPageComponents/taskPanel/TaskPanel";
import LogoutButton from "../../components/mainPageComponents/logoutButton/LogoutButton";
import CalendarMain from "../../components/mainPageComponents/calendarMain/CalendarMain";
import { FaCog } from "react-icons/fa"; // for settings icon

function MainPage({ isLoggin, setIsLoggin }) {
  const [userEmail, setUserEmail] = useState(null);

  // 🧠 טען אימייל מה־session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("http://localhost:8801/api/auth/getSession", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.userEmail) {
          setUserEmail(data.userEmail);
          console.log("User email:", data.email);
        } else {
          console.warn("No email in session");
        }
      } catch (err) {
        console.error("❌ Failed to fetch session:", err);
      }
    };

    fetchSession();
  }, []);

  if (!userEmail) {
    return <div>Loading...</div>; // אפשר לשים גם Spinner
  }

  return (
    <div className={classes.pageWrapper}>
      {/* Top Bar */}
      <header className={classes.topBar}>
        <div className={classes.searchContainer}>
          <input
            type="text"
            placeholder="Search Task"
            className={classes.searchInput}
          />
        </div>
        <div className={classes.topBarButtons}>
          <FaCog className={classes.settingsIcon} />
          <LogoutButton setIsLoggin={setIsLoggin} />
        </div>
      </header>

      {/* Main Layout: Sidebar + Calendar + Task Panel */}
      <div className={classes.mainContent}>
        <div className={classes.sidebar}>
          <Sidebar userEmail={userEmail} />
        </div>
        <div className={classes.calendar}>
          <CalendarMain userEmail={userEmail} />
        </div>
        <div className={classes.taskPanel}>
          <TaskPanel userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
