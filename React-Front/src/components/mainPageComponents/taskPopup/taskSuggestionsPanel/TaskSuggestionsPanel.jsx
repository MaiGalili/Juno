// TaskPopup/TaskSuggestionsPanel/TaskSuggestionsPanel.jsx
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
  const [offset, setOffset] = useState(0); // for "Show more"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // require duration + dueDate (waiting task)
  const canQuery = useMemo(
    () => Boolean(duration && dueDate),
    [duration, dueDate]
  );

  useEffect(() => {
    if (!canQuery) {
      setSuggestions([]);
      return;
    }
    const abort = new AbortController();
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError("");

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
    duration,
    dueDate,
    dueTime,
    bufferTime,
    locationId,
    customAddress,
    offset,
  ]);

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

  // אם המשתמש/ת משנה פרמטרים (למשל dueDate), נאתחל פאג'ינציה
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

  const LOCALE = "en-US"; // or: navigator.language || "en-US"
  const HOUR12 = true; // set false for 24h clock

  const formatTime = (dateStr, timeStr) => {
    if (!timeStr) return "";
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return d.toLocaleTimeString(LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      hour12: HOUR12,
    });
  };

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

      {!canQuery && (
        <div className={styles.empty}>
          Fill in <b>duration</b> and <b>due date</b> to see suggestions.
        </div>
      )}

      {canQuery && error && (
        <div className={styles.error}>
          {error}{" "}
          <button type="button" onClick={resetPaging}>
            Try again
          </button>
        </div>
      )}

      {canQuery && !error && suggestions.length === 0 && !loading && (
        <div className={styles.empty}>No free time suggestions found.</div>
      )}

      {suggestions.length > 0 && (
        <ul className={styles.list}>
          {suggestions.map((s) => (
            <li
              key={`${s.startDate}-${s.startTime}-${s.endTime}`}
              className={styles.item}
            >
              <div className={styles.itemMain}>
                <div className={styles.itemWhen}>{formatLabel(s)}</div>
                {s.meta && <div className={styles.itemMeta}>{s.meta}</div>}
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

      {canQuery && !loading && (
        <div className={styles.moreRow}>
          <button type="button" className={styles.moreBtn} onClick={showMore}>
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
