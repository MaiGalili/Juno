// MainPage.jsx
import React, { useEffect, useState } from "react";
import classes from "./mainPage.module.css";

// Components
import TopBar from "../../components/mainPageComponents/topbar/Topbar";
import Sidebar from "../../components/mainPageComponents/sidebar/Sidebar";
import TaskPanel from "../../components/mainPageComponents/taskPanel/TaskPanel";
import CalendarMain from "../../components/mainPageComponents/calendarMain/CalendarMain";
import TaskPopup from "../../components/mainPageComponents/taskPopup/TaskPopup";
import Reports from "../../components/mainPageComponents/sidebar/reports/Reports";

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showReports, setShowReports] = useState(false);

  // Functions to open and close the popup
  const handleCreateTask = () => {
    setPopupMode("create");
    setSelectedTask(null); // Clear the selected task when creating
    setShowPopup(true);
  };

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
    setPopupMode("view");
    setSelectedTask(task);
    setShowPopup(true);
  };

  // Open TaskPopup in edit mode from the search result
  const handleTaskSelectFromSearch = (item) => {
    // item comes from /api/tasks/search -> { id, type, title, ... }
    if (!item) return;

    if (item.type === "assigned") {
      // we already have assigned tasks in state (with .raw as the original db row)
      const hit = tasks.find((t) => t.id === item.id);
      const taskToEdit = hit?.raw || null;
      if (taskToEdit) {
        setSelectedTask(taskToEdit);
        setPopupMode("edit");
        setShowPopup(true);
      }
    } else if (item.type === "waiting") {
      // waitingTasks are in a separate list
      const w = waitingTasks.find((x) => x.task_id === item.id);
      if (w) {
        setSelectedTask(w);
        setPopupMode("edit");
        setShowPopup(true);
      }
    }
  };

  return (
    <div className={classes.pageWrapper}>
      {/* Top bar with search, settings, logout */}
      <TopBar
        onTaskSelect={handleTaskSelectFromSearch}
        setIsLoggin={setIsLoggin}
      />

      {/* Main content layout */}
      <div className={classes.mainContent}>
        <div className={classes.sidebar}>
          <Sidebar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            userEmail={userEmail}
            setShowPopup={setShowPopup}
            userCategories={categories}
            fetchCategories={fetchCategories}
            userLocations={locations}
            fetchLocations={fetchLocations}
            onCreateTask={handleCreateTask}
            onShowReports={() => setShowReports(true)}
          />
        </div>
        <div className={classes.calendar}>
          <CalendarMain
            userEmail={userEmail}
            tasks={tasks}
            fetchTasks={fetchTasks}
            userCategories={categories}
            userLocations={locations}
            onSelectTask={handleSelectTask}
            onCreateTask={(slotTask) => {
              setPopupMode("create");
              setSelectedTask(slotTask);
              setShowPopup(true);
            }}
            date={selectedDate}
            onDateChange={setSelectedDate}
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
          tasks={tasks}
        />
      )}

      {showReports && (
        <Reports
          open={showReports}
          onClose={() => setShowReports(false)}
          tasks={tasks}
          userSettings={userSettings}
        />
      )}
    </div>
  );
}

export default MainPage;
