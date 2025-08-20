import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./searchBar.module.css";

export default function SearchBar({ onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const abortRef = useRef(null);

  const debouncedQ = useDebounce(q, 180);

  useEffect(() => {
    if (!debouncedQ) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const params = new URLSearchParams({ q: debouncedQ });
        const res = await fetch(`/api/tasks/search?${params.toString()}`, {
          credentials: "include",
          signal: ac.signal,
        });
        const json = await res.json();
        if (json?.success) {
          setResults(json.data || []);
          setOpen(true);
          setHighlight(0);
        } else {
          setResults([]);
          setOpen(false);
        }
      } catch {
        // ignore aborts
      }
    })();

    return () => ac.abort();
  }, [debouncedQ]);

  const pick = (idx) => {
    const item = results[idx];
    if (!item) return;
    onPick?.(item); // { id, type, title, date, time }
    // keep the text but close dropdown
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(highlight);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        placeholder="Search task by title…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((r, i) => (
            <li
              key={`${r.type}-${r.id}`}
              className={i === highlight ? styles.itemActive : styles.item}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus
                pick(i);
              }}
            >
              <div className={styles.title}>{r.title}</div>
              <div className={styles.meta}>
                {r.type === "assigned" ? "Assigned" : "Waiting"}
                {r.date ? ` • ${r.date}` : ""}
                {r.time ? ` ${r.time?.slice(0, 5)}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function useDebounce(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
