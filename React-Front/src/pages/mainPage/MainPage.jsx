import React, { useEffect, useState } from "react";
import classes from "./mainPage.module.css";

import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";
import TaskPanel from "../../components/mainPageComponents/taskPanel/TaskPanel";
import LogoutButton from "../../components/mainPageComponents/logoutButton/LogoutButton";
import CalendarMain from "../../components/mainPageComponents/calendarMain/CalendarMain";
import TaskPopup from "../../components/mainPageComponents/taskPopup/TaskPopup";
import { FaCog } from "react-icons/fa";

function MainPage({ isLoggin, setIsLoggin }) {
  const [userEmail, setUserEmail] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("http://localhost:8801/api/tasks/assigned", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });

      const data = await res.json();
      if (!data || data.success === false || !Array.isArray(data.data)) {
        console.error("Invalid task data received:", data);
        return;
      }

      const formatted = data.data.map((task) => {
        const startDate = task.task_start_date;
        const endDate = task.task_end_date;
        const startTime = task.task_start_time?.slice(0, 5);
        const endTime = task.task_end_time?.slice(0, 5);

        const start =
          startDate && startTime ? new Date(`${startDate}T${startTime}`) : null;
        const end =
          endDate && endTime ? new Date(`${endDate}T${endTime}`) : null;

        return {
          id: task.task_id,
          title: task.task_title,
          start,
          end,
          allDay: task.task_all_day === 1 || !start || !end,
          note: task.task_note,
          categories: task.categories,
          raw: task,
        };
      });

      setTasks(formatted);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("http://localhost:8801/api/auth/getSession", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.userEmail) {
          setUserEmail(data.userEmail);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchTasks();
    }
  }, [userEmail]);

  if (!userEmail) {
    return <div>Loading...</div>;
  }
  const onSave = async (taskData) => {
    await fetchTasks();
    setShowPopup(false);
  };
  return (
    <div className={classes.pageWrapper}>
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

      <div className={classes.mainContent}>
        <div className={classes.sidebar}>
          <Sidebar userEmail={userEmail} setShowPopup={setShowPopup} />
        </div>
        <div className={classes.calendar}>
          <CalendarMain
            userEmail={userEmail}
            tasks={tasks}
            fetchTasks={fetchTasks}
          />
        </div>
        <div className={classes.taskPanel}>
          <TaskPanel
            userEmail={userEmail}
            tasks={tasks}
            fetchTasks={fetchTasks}
          />
        </div>
      </div>

      {showPopup && (
        <TaskPopup
          mode="create"
          onClose={() => setShowPopup(false)}
          onSave={onSave}
          fetchTasks={fetchTasks}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}

export default MainPage;
