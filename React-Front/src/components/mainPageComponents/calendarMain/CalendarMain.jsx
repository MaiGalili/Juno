// CalendarMain.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import TaskPopup from "../taskPopup/TaskPopup";

// Locale configuration for the calendar (English - US)
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

// Setup the localizer using date-fns functions
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function CalendarMain({
  userEmail,
  tasks,
  fetchTasks,
  userCategories,
  userLocations,
  onSelectTask,
  onCreateTask,
}) {

  //State
  const [currentView, setCurrentView] = useState("week");

  //Style customizer for events
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

  
  //When an existing task is selected from the calendar
  const handleSelectEvent = (event) => {
    onSelectTask?.(event.raw || event);
  };

  //When a time slot is selected (for creating a new task)
  const handleSelectSlot = (slotInfo) => {
    onCreateTask?.({
      task_start_date: format(slotInfo.start, "yyyy-MM-dd"),
      task_end_date: format(slotInfo.end, "yyyy-MM-dd"),
      task_all_day: true,
    });
  };

  //Callback after saving a task
  const onSave = async () => {
    await fetchTasks();
  };

  return (
    <div style={{ height: "calc(100vh - 100px)", padding: "20px" }}>
      <Calendar
        view={currentView}
        onView={setCurrentView}
        localizer={localizer}
        events={tasks}
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
    </div>
  );
}
