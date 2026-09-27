import { useState, useEffect, useRef } from "react";

const POLL_INTERVAL = 10_000; // 10 seconds
const LOCAL_COUNTER_KEY = "gtc_cards_generated_count";
const COUNTER_EVENT = "gtc_counter_updated";

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

export async function incrementCounter() {
  // 1. Instantly update local count and broadcast event to all open UI listeners
  const currentLocal = getLocalCount();
  const nextLocal = currentLocal + 1;
  setLocalCount(nextLocal);

  // 2. Persist to backend / Redis if available
  try {
    const res = await fetch("/api/counter/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === "number") {
        const finalCount = Math.max(data.count, nextLocal);
        setLocalCount(finalCount);
        return finalCount;
      }
    }
  } catch (_) {
    // Backend offline / static mode: local increment already applied
  }
  return nextLocal;
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
      const localCount = getLocalCount();
      const finalCount = Math.max(serverCount, localCount);
      setCount(finalCount);
      setLocalCount(finalCount);
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
