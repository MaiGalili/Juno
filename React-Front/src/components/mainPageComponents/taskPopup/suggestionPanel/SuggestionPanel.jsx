import React, { useState } from "react";

export default function SuggestionPanel({
  dueDate,
  dueTime,
  duration,
  bufferTime,
  locationId,
  userEmail,
  onSelectSlot,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const fetchSuggestions = async () => {
    if (!dueDate || !duration) {
      setError("Due date and duration are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8801/api/tasks/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          due_date: dueDate,
          due_time: dueTime || null,
          duration,
          buffer_time: bufferTime || 0,
          location_id: locationId || null,
          email: userEmail,
          page,
        }),
      });

      const result = await res.json();

      if (result.success) {
        if (!result.slots || result.slots.length === 0) {
          setHasMore(false);
          if (slots.length === 0) {
            setError("No available suggestions for this date.");
          }
        } else {
          setSlots((prev) => [...prev, ...result.slots]);
          setPage((prev) => prev + 1);
          setHasMore(result.hasMore);
        }
      } else {
        setError(result.message || "Failed to fetch suggestions.");
      }
    } catch (err) {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ marginTop: "15px", padding: "10px", border: "1px solid #ccc" }}
    >
      <h4>Suggestions</h4>

      {!slots.length && (
        <button type="button" onClick={fetchSuggestions} disabled={loading}>
          {loading ? "Loading..." : "Get Suggestions"}
        </button>
      )}

      {slots.length > 0 && (
        <div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {slots.map((slot, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() =>
                    onSelectSlot(
                      `${dueDate}T${slot.start}`,
                      `${dueDate}T${slot.end}`
                    )
                  }
                  style={{
                    padding: "8px",
                    border: "1px solid #999",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {slot.start} - {slot.end} | Travel Time: {slot.travel_time}
                </button>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button type="button" onClick={fetchSuggestions} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          )}

          {!hasMore && <p>No more options available.</p>}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
