// TaskSuggestionsPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./taskSuggestionsPanel.module.css";

export default function TaskSuggestionsPanel({
  duration,
  dueDate, // <-- נצטרך להעביר מהפופאפ (ראה סעיף 2)
  dueTime,
  startDate, // אופציונלי — אם את רוצה להגביל ליום מסוים
  bufferTime,
  locationId,
  customAddress,
  onSelectSuggestion,
}) {
  const [offset, setOffset] = useState(0); // for "Show more"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const canQuery = useMemo(() => {
    //for minimal validation
    return Boolean(duration && (dueDate || startDate));
  }, [duration, dueDate, startDate]);

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

        const res = await fetch("/api/tasks/suggestions", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            duration, // "01:30"
            dueDate, // "2025-08-07" (לא חובה אם יש startDate)
            dueTime, // "15:00" (אופציונלי)
            startDate, // אם עורכים/יוצרים לשיבוץ ביום מסוים
            bufferTime, // "00:10" או "00:10:00"
            locationId: locationId || null,
            customAddress: customAddress || null,
            offset, // דפדוף הצעות
            limit: 3,
          }),
        });

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
    startDate,
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
    startDate,
    bufferTime,
    locationId,
    customAddress,
  ]);

  const formatLabel = (sug) => {
    // מציגים: יום, תאריך ושעות
    try {
      const d = new Date(`${sug.startDate}T${sug.startTime || "00:00"}:00`);
      const dayName = d.toLocaleDateString("he-IL", { weekday: "long" });
      const dateStr = d.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const hours = `${sug.startTime || ""}–${sug.endTime || ""}`;
      return `${dayName}, ${dateStr} | ${hours}`;
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
          Fill in <b>duration</b> and <b>due date</b> (or a specific start date)
          to see suggestions.
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
