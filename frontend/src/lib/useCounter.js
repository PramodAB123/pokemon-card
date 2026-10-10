import { useState, useEffect, useRef } from "react";

const POLL_INTERVAL = 10_000; // 10 seconds
const LOCAL_COUNTER_KEY = "gtc_cards_generated_count";
const LOCAL_USERS_KEY = "gtc_counted_usernames";
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

function getCountedUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markUserCounted(username) {
  try {
    const set = getCountedUsers();
    set.add(username.toLowerCase());
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...set]));
  } catch {}
}

/**
 * Increments the card counter if this username has not been generated yet.
 * Prevents duplicate increment for repeated searches or React StrictMode double mounts.
 */
export async function incrementCounter(username) {
  const cleanUser = username ? String(username).trim().toLowerCase() : "";
  const counted = getCountedUsers();

  // If this username was already recorded locally, skip incrementing
  if (cleanUser && counted.has(cleanUser)) {
    return getLocalCount();
  }

  if (cleanUser) {
    markUserCounted(cleanUser);
  }

  const currentLocal = getLocalCount();
  const nextLocal = currentLocal + 1;
  setLocalCount(nextLocal);

  // Persist to Upstash Redis if available
  try {
    const res = await fetch("/api/counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUser }),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === "number") {
        const finalCount = Math.max(data.count, nextLocal);
        setLocalCount(finalCount);
        return finalCount;
      }
    }
  } catch {
    // Offline / fallback mode
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
