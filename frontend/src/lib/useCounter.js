import { useState, useEffect, useRef } from "react";

const POLL_INTERVAL = 10_000; // 10 seconds
const LOCAL_COUNTER_KEY = "gtc_cards_generated_count";
const COUNTER_EVENT = "gtc_counter_updated";

// In-flight guard to prevent React 18 StrictMode dev double-fire in the same component render
const inFlightUsers = new Set();

function getLocalCount() {
  try {
    const val = localStorage.getItem(LOCAL_COUNTER_KEY);
    return val !== null ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function setLocalCount(val) {
  try {
    localStorage.setItem(LOCAL_COUNTER_KEY, String(val));
    window.dispatchEvent(new CustomEvent(COUNTER_EVENT, { detail: { count: val } }));
  } catch {}
}

/**
 * Sends username to /api/counter.
 * Redis is the single source of truth for uniqueness (via atomic SADD).
 */
export async function incrementCounter(username) {
  const cleanUser = username ? String(username).trim().toLowerCase() : "";
  if (!cleanUser) return getLocalCount();

  // Prevent immediate duplicate call during React StrictMode double-mount
  if (inFlightUsers.has(cleanUser)) {
    return getLocalCount();
  }
  inFlightUsers.add(cleanUser);
  setTimeout(() => inFlightUsers.delete(cleanUser), 4000);

  try {
    const res = await fetch("/api/counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUser }),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === "number") {
        setLocalCount(data.count);
        return data.count;
      }
    }
  } catch (err) {
    console.warn("Counter sync:", err);
  }

  return getLocalCount();
}

/**
 * Fetches /api/counter and polls every 10s.
 * Returns { count, loading, error, refresh }
 */
export function useCounter() {
  const [count, setCount]     = useState(getLocalCount());
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const timerRef = useRef(null);

  async function fetchCount() {
    try {
      const res = await fetch("/api/counter");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const serverCount = typeof json.count === "number" ? json.count : 0;
      setCount(serverCount);
      setLocalCount(serverCount);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCount(getLocalCount());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCount();
    timerRef.current = setInterval(fetchCount, POLL_INTERVAL);

    const handleUpdate = (e) => {
      if (e.detail && typeof e.detail.count === "number") {
        setCount(e.detail.count);
      }
    };
    window.addEventListener(COUNTER_EVENT, handleUpdate);
    window.addEventListener("storage", () => setCount(getLocalCount()));

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener(COUNTER_EVENT, handleUpdate);
      window.removeEventListener("storage", () => setCount(getLocalCount()));
    };
  }, []);

  return { count, loading, error, refresh: fetchCount };
}
