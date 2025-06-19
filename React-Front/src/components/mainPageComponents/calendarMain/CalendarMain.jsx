// CalendarMain.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import TaskPopup from "../taskPopup/TaskPopup";
import { data } from "react-router-dom";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function CalendarMain({ userEmail }) {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupMode, setPopupMode] = useState("view");
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentView, setCurrentView] = useState("week");

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:8801/api/tasks/assigned", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail }),
      });

      const data = await res.json();

      console.log(data.data);
      if (!data || data.success === false || !Array.isArray(data.data)) {
        console.error("❌ Invalid task data received:", data);
        return;
      }

      const formatted = data.data.map((task) => {
        const startDate = task.task_start_date;
        const endDate = task.task_end_date;
        const startTime = task.task_start_time?.slice(0, 5); // HH:mm
        const endTime = task.task_end_time?.slice(0, 5); // HH:mm

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

      console.log(formatted);

      setEvents(formatted);
    } catch (err) {
      console.error("❌ Failed to load tasks:", err);
    }
  };

  //  פונקציה שמביאה משימות
  useEffect(() => {
    if (userEmail) {
      fetchTasks();
    }
  }, [userEmail]);

  const eventStyleGetter = (event) => {
    const colors = event.categories?.map((c) => c.color) || ["#ccc"];
    const background =
      colors.length > 1
        ? `linear-gradient(90deg, ${colors.join(",")})`
        : colors[0];
    return {
      style: {
        background,
        border: "none",
        color: "#000",
        fontWeight: "bold",
        borderRadius: "6px",
      },
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event.raw);
    setPopupMode("view");
    setPopupOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedTask({
      start_date: format(slotInfo.start, "yyyy-MM-dd"),
      end_date: format(slotInfo.end, "yyyy-MM-dd"),
      all_day: true,
    });
    setPopupMode("create");
    setPopupOpen(true);
  };
  
  return (
    <div style={{ height: "calc(100vh - 100px)", padding: "20px" }}>
      <Calendar
        view={currentView}
        onView={(view) => setCurrentView(view)}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["day", "week", "month"]}
        selectable
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
      />

      {popupOpen && (
        <TaskPopup
          mode={popupMode}
          task={selectedTask}
          onSave={() => {
            setPopupOpen(false);
            fetchTasks();
          }}
          selectedTask={selectedTask}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </div>
  );
}
