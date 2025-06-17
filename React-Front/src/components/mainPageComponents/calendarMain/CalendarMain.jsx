import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

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

  useEffect(() => {
    fetch("http://localhost:8801/api/tasks", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((task) => {
          const start = new Date(`${task.task_date}T${task.task_start_time}`);
          const end = new Date(`${task.task_date}T${task.task_end_time}`);
          return {
            title: task.task_title,
            start,
            end,
            id: task.task_id,
            note: task.task_note,
          };
        });
        setEvents(formatted);
      })
      .catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  return (
    <div style={{ height: "calc(100vh - 100px)", padding: "20px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["month", "week", "day", "agenda"]}
        style={{ height: "100%" }}
        onSelectEvent={(event) =>
          alert(`Task: ${event.title}\nNote: ${event.note}`)
        }
      />
    </div>
  );
}
