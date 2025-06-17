// CalendarMain.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import TaskPopup from "../taskPopup/TaskPopup";

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

export default function CalendarMain() {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupMode, setPopupMode] = useState("view");
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentView, setCurrentView] = useState("week");

  useEffect(() => {
    fetch("http://localhost:8801/api/tasks", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 כל המשימות מהשרת:", data);
        const formatted = data
          .filter((task) => task.task_start_date && task.task_end_date)
          .map((task) => {
            const start = new Date(
              `${task.task_start_date}T${task.task_start_time}`
            );
            const end = new Date(`${task.task_end_date}T${task.task_end_time}`);
            return {
              id: task.task_id,
              title: task.task_title,
              start,
              end,
              allDay: task.task_all_day,
              note: task.task_note,
              categories: task.categories || [],
              raw: task,
            };
          });
        console.log("🎨 משימות אחרי עיבוד:", formatted);
        setEvents(formatted);
      })
      .catch((err) => console.error("Failed to load tasks:", err));
  }, []);
  
  

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
      {/* לוח השנה */}
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
            window.location.reload();
          }}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </div>
  );
}
