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

const LOCAL_USERS_KEY = "gtc_unique_users_list";

function getLocalUsers() {
  try {
    const val = localStorage.getItem(LOCAL_USERS_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function setLocalUsers(users) {
  try {
    if (Array.isArray(users)) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
  } catch {}
}

export function setLocalCounterState(val, users) {
  try {
    localStorage.setItem(LOCAL_COUNTER_KEY, String(val));
    if (users) setLocalUsers(users);
    window.dispatchEvent(
      new CustomEvent(COUNTER_EVENT, { detail: { count: val, uniqueUsers: users || [] } })
    );
  } catch {}
}

/**
 * Sends username to /api/counter.
 * Redis is the single source of truth for uniqueness (via atomic SADD).
 */
export async function incrementCounter(username) {
  const cleanUser = username ? String(username).trim().toLowerCase().replace(/^@/, "") : "";
  if (!cleanUser) return getLocalCount();

  // Prevent immediate duplicate call during React StrictMode double-mount
  if (inFlightUsers.has(cleanUser)) {
    return getLocalCount();
  }
  inFlightUsers.add(cleanUser);
  setTimeout(() => inFlightUsers.delete(cleanUser), 1500);

  try {
    const res = await fetch("/api/counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUser }),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === "number") {
        setLocalCounterState(data.count, data.unique_users);
        // Also do a quick follow-up GET to confirm and sync across any latency
        setTimeout(async () => {
          try {
            const confirm = await fetch("/api/counter");
            if (confirm.ok) {
              const cd = await confirm.json();
              if (typeof cd.count === "number") {
                setLocalCounterState(cd.count, cd.unique_users);
              }
            }
          } catch {}
        }, 600);
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
 * Returns { count, uniqueUsers, loading, error, refresh }
 */
export function useCounter() {
  const [count, setCount]             = useState(getLocalCount());
  const [uniqueUsers, setUniqueUsers] = useState(getLocalUsers());
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const timerRef = useRef(null);

  async function fetchCount() {
    try {
      const res = await fetch("/api/counter");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const serverCount = typeof json.count === "number" ? json.count : 0;
      const serverUsers = Array.isArray(json.unique_users) ? json.unique_users : [];
      setCount(serverCount);
      setUniqueUsers(serverUsers);
      setLocalCounterState(serverCount, serverUsers);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCount(getLocalCount());
      setUniqueUsers(getLocalUsers());
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
        if (Array.isArray(e.detail.uniqueUsers)) {
          setUniqueUsers(e.detail.uniqueUsers);
        }
      }
    };
    window.addEventListener(COUNTER_EVENT, handleUpdate);
    window.addEventListener("storage", () => {
      setCount(getLocalCount());
      setUniqueUsers(getLocalUsers());
    });

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener(COUNTER_EVENT, handleUpdate);
      window.removeEventListener("storage", () => {
        setCount(getLocalCount());
        setUniqueUsers(getLocalUsers());
      });
    };
  }, []);

  return { count, uniqueUsers, loading, error, refresh: fetchCount };
}
