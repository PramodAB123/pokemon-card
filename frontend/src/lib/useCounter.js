import { useState, useEffect, useRef } from "react";

const POLL_INTERVAL = 10_000; // 10 seconds

/**
 * Fetches /api/counter and polls every 10s.
 * Returns { count, loading, error }
 */
export function useCounter() {
  const [count, setCount]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const timerRef = useRef(null);

  async function fetchCount() {
    try {
      const res = await fetch("/api/counter");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCount(json.count ?? 0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCount();
    timerRef.current = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  return { count, loading, error };
}
