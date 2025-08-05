// MainPage.jsx
import React, { useEffect, useState } from "react";
import classes from "./mainPage.module.css";

// Components
import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";
import TaskPanel from "../../components/mainPageComponents/taskPanel/TaskPanel";
import LogoutButton from "../../components/mainPageComponents/logoutButton/LogoutButton";
import CalendarMain from "../../components/mainPageComponents/calendarMain/CalendarMain";
import TaskPopup from "../../components/mainPageComponents/taskPopup/TaskPopup";

//icon Settings
import { FaCog } from "react-icons/fa";

function MainPage({ isLoggin, setIsLoggin }) {
  const [userEmail, setUserEmail] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [waitingTasks, setWaitingTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupMode, setPopupMode] = useState("view");
  const [userSettings, setUserSettings] = useState({});

  // Fetch locations
  const fetchLocations = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("http://localhost:8801/api/locations", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load locations:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch("http://localhost:8801/api/categories", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // Fetch assigned tasks for the current user
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

      // Format tasks for use with calendar
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

  // Fetch waiting tasks
  const fetchWaitingTasks = async () => {
    try {
      const res = await fetch("http://localhost:8801/api/tasks/waiting", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWaitingTasks(data.data);
      }
    } catch (err) {
      console.error("Failed to load waiting tasks:", err);
    }
  };

  // Check session and get user email on mount
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

  // Fetch tasks once user email is available
  useEffect(() => {
    if (userEmail) {
      fetchTasks();
      fetchCategories();
      fetchLocations();
      fetchWaitingTasks();
    }
  }, [userEmail]);

  // Fetch user settings
  useEffect(() => {
    if (!userEmail) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`http://localhost:8801/api/users/settings`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.success) setUserSettings(data);
      } catch (err) {
        console.error("Failed to load user settings:", err);
      }
    };
    fetchSettings();
  }, [userEmail]);

  // Show loading screen while session is being resolved
  if (!userEmail) {
    return <div>Loading...</div>;
  }

  // Callback when saving a new task
  const onSave = async (taskData) => {
    await fetchTasks();
    await fetchWaitingTasks();
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setShowPopup(true);
  };

  return (
    <div className={classes.pageWrapper}>
      {/* Top bar with search, settings, logout */}
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

      {/* Main content layout */}
      <div className={classes.mainContent}>
        <div className={classes.sidebar}>
          <Sidebar
            userEmail={userEmail}
            setShowPopup={setShowPopup}
            userCategories={categories}
            fetchCategories={fetchCategories}
            userLocations={locations}
            fetchLocations={fetchLocations}
          />
        </div>
        <div className={classes.calendar}>
          <CalendarMain
            userEmail={userEmail}
            tasks={tasks}
            fetchTasks={fetchTasks}
            userCategories={categories}
            userLocations={locations}
          />
        </div>
        <div className={classes.taskPanel}>
          <TaskPanel
            upcomingTasks={tasks}
            waitingTasks={waitingTasks}
            onSelectTask={handleSelectTask}
          />
        </div>
      </div>
      {/* Popup for creating new task */}
      {showPopup && (
        <TaskPopup
          mode={popupMode}
          task={selectedTask}
          onClose={() => setShowPopup(false)}
          onSave={onSave}
          fetchTasks={fetchTasks}
          userEmail={userEmail}
          userCategories={categories}
          fetchCategories={fetchCategories}
          userLocations={locations}
          fetchLocations={fetchLocations}
          userSettings={userSettings}
        />
      )}
    </div>
  );
}

export default MainPage;
