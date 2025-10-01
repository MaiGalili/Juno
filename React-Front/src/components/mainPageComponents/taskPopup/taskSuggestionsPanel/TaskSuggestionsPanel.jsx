// components/mainPageComponents/taskPopup/taskSuggestionsPanel/TaskSuggestionsPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./taskSuggestionsPanel.module.css";

export default function TaskSuggestionsPanel({
  userEmail,
  duration,
  dueDate,
  dueTime,
  bufferTime,
  locationId,
  customAddress,
  customCoords,
  onSelectSuggestion,
}) {
  // Paging & fetch status
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Check past-due (date + time)
  const todayYMD = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const isPastDue = useMemo(() => {
    if (!dueDate) return false;

    const now = new Date();
    const todayStr = todayYMD();

    // If due date is before today → past due
    if (dueDate < todayStr) return true;

    // If due date is today and time exists → compare minutes
    if (dueDate === todayStr && dueTime) {
      const [hh, mm] = dueTime.split(":").map(Number);
      const dueMinutes = (hh || 0) * 60 + (mm || 0);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      return nowMinutes > dueMinutes;
    }

    return false;
  }, [dueDate, dueTime]);

  // require duration + dueDate (waiting task)
  const canQuery = useMemo(
    () => Boolean(duration && dueDate),
    [duration, dueDate]
  );

  // Fetch suggestions from backend
  useEffect(() => {
    if (!canQuery || isPastDue) {
      setSuggestions([]);
      setLoading(false);
      setError("");
      return;
    }

    const abort = new AbortController();
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError("");

        // Provide "now" context for same-day constraints on the server
        const now = new Date();
        const nowYMD = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const nowMinOfDay = now.getHours() * 60 + now.getMinutes();

        const res = await fetch("/api/tasks/suggestions", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            userEmail,
            duration,
            dueDate,
            dueTime,
            bufferTime,
            locationId: locationId || null,
            customAddress: customAddress || null,
            customLat: customCoords?.lat ?? null,
            customLng: customCoords?.lng ?? null,
            nowYMD,
            nowMinOfDay,
            offset,
            limit: 3,
          }),
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized");
          const msg = await res.text();
          throw new Error(msg || "Request failed");
        }

        const data = await res.json();
        if (!data?.success) {
          throw new Error(data?.message || "Failed to fetch suggestions");
        }
        setSuggestions(data.data || []);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Network error");
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    return () => abort.abort();
  }, [
    canQuery,
    isPastDue,
    duration,
    dueDate,
    dueTime,
    bufferTime,
    locationId,
    customAddress,
    customCoords,
    offset,
  ]);

  // Send a normalized selection back to parent (keeps HH:MM only)
  const handlePick = (sug) => {
    onSelectSuggestion?.({
      startDate: sug.startDate,
      endDate: sug.endDate ?? sug.startDate,
      startTime: (sug.startTime || "").slice(0, 5),
      endTime: (sug.endTime || "").slice(0, 5),
    });
  };

  const showMore = () => setOffset((o) => o + 3);
  const resetPaging = () => setOffset(0);

  // Reset paging whenever the input filters change
  useEffect(() => {
    resetPaging();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    duration,
    dueDate,
    dueTime,
    bufferTime,
    locationId,
    customAddress,
    customCoords,
  ]);

  // Display preferences (toggle 12h/24h as needed)
  const LOCALE = "en-US";
  const HOUR12 = false;

  const formatTime = (dateStr, timeStr) => {
    if (!timeStr) return "";
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return d.toLocaleTimeString(LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      hour12: HOUR12,
    });
  };

  // List label: "Wednesday, 03/27/2025 | 9:30–10:30 AM"
  const formatLabel = (sug) => {
    try {
      const d = new Date(`${sug.startDate}T${sug.startTime || "00:00"}:00`);
      const dayName = d.toLocaleDateString(LOCALE, { weekday: "long" });
      const dateStr = d.toLocaleDateString(LOCALE, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      const start = formatTime(sug.startDate, sug.startTime);
      const end = formatTime(sug.startDate, sug.endTime);
      return `${dayName}, ${dateStr} | ${start}${
        start && end ? "–" : ""
      }${end}`;
    } catch {
      return `${sug.startDate} ${sug.startTime || ""}–${sug.endTime || ""}`;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h4 className={styles.title}>Suggestions</h4>
        {loading && <span className={styles.loading}>Loading…</span>}
      </div>

      {/* Require minimal inputs */}
      {!canQuery && (
        <div className={styles.empty}>
          Fill in <b>duration</b> and <b>due date</b> to see suggestions.
        </div>
      )}

      {/* Past-due message (date OR time) */}
      {canQuery && isPastDue && (
        <div className={styles.warning}>
          The due date/time (
          <b>
            {dueDate}
            {dueTime ? ` ${dueTime}` : ""}
          </b>
          ) has already passed. Update the due date to get fresh time
          suggestions.
        </div>
      )}

      {/* Error state */}
      {canQuery && !isPastDue && error && (
        <div className={styles.error}>
          {error}{" "}
          <button type="button" onClick={resetPaging}>
            Try again
          </button>
        </div>
      )}

      {/* No results */}
      {canQuery &&
        !isPastDue &&
        !error &&
        suggestions.length === 0 &&
        !loading && (
          <div className={styles.empty}>No free time suggestions found.</div>
        )}

      {/* Results list */}
      {!isPastDue && suggestions.length > 0 && (
        <ul className={styles.list}>
          {suggestions.map((s) => (
            <li
              key={`${s.startDate}-${s.startTime}-${s.endTime}`}
              className={styles.item}
            >
              <div className={styles.itemMain}>
                <div className={styles.itemWhen}>{formatLabel(s)}</div>
              </div>
              <button
                type="button"
                className={styles.pickBtn}
                onClick={() => handlePick(s)}
              >
                Choose
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Paging */}
      {canQuery && !isPastDue && !loading && (
        <div className={styles.moreRow}>
          <button type="button" className={styles.moreBtn} onClick={showMore}>
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
