import React, { useEffect, useRef, useState } from "react";
import { useCounter } from "../lib/useCounter.js";

const RECENT_KEY = "gitstar-explorer-recent";
function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}
function addRecent(username) {
  let list = getRecent().filter((u) => u.toLowerCase() !== username.toLowerCase());
  list.unshift(username);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
}

// Input quantum pulse effect
function initInputQuantum(canvas, input) {
  if (!canvas || !input) return () => {};
  const ctx = canvas.getContext("2d");
  let focused = false;
  let typingTimer = null;

  function syncSize() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    canvas.width = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
  }

  function roundRect(cx, x, y, w, h, r) {
    cx.beginPath();
    cx.moveTo(x + r, y);
    cx.lineTo(x + w - r, y);
    cx.arcTo(x + w, y, x + w, y + r, r);
    cx.lineTo(x + w, y + h - r);
    cx.arcTo(x + w, y + h, x + w - r, y + h, r);
    cx.lineTo(x + r, y + h);
    cx.arcTo(x, y + h, x, y + h - r, r);
    cx.lineTo(x, y + r);
    cx.arcTo(x, y, x + r, y, r);
    cx.closePath();
  }

  function drawGlow(isFocused) {
    syncSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.strokeStyle = isFocused ? "rgba(56, 189, 248, 0.6)" : "rgba(56, 189, 248, 0.12)";
    ctx.lineWidth = isFocused ? 2 : 1;
    ctx.shadowColor = isFocused ? "rgba(56, 189, 248, 0.8)" : "rgba(56, 189, 248, 0.2)";
    ctx.shadowBlur = isFocused ? 18 : 6;
    roundRect(ctx, 1, 1, canvas.width - 2, canvas.height - 2, 12);
    ctx.stroke();
    ctx.restore();
  }

  const onFocus = () => {
    focused = true;
    drawGlow(true);
  };
  const onBlur = () => {
    focused = false;
    drawGlow(false);
  };
  const onInput = () => {
    drawGlow(true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      drawGlow(focused);
    }, 400);
  };

  input.addEventListener("focus", onFocus);
  input.addEventListener("blur", onBlur);
  input.addEventListener("input", onInput);
  window.addEventListener("resize", syncSize);

  syncSize();
  drawGlow(false);

  return () => {
    window.removeEventListener("resize", syncSize);
    input.removeEventListener("focus", onFocus);
    input.removeEventListener("blur", onBlur);
    input.removeEventListener("input", onInput);
  };
}

export default function SearchForm({ onSearch, initialError = "" }) {
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(initialError);
  const [recent, setRecent] = useState([]);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // Live card counter
  const { count, loading: counterLoading } = useCounter();
  const [displayCount, setDisplayCount] = useState(0);
  const animRef = useRef(null);
  const displayCountRef = useRef(0);
  displayCountRef.current = displayCount;

  // Animate the number up when count changes
  useEffect(() => {
    if (count === null) return;
    const start = displayCountRef.current;
    const end = count;
    if (start === end) return;
    const duration = 800;
    const startTime = performance.now();
    cancelAnimationFrame(animRef.current);

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplayCount(Math.round(start + (end - start) * eased));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [count]);

  useEffect(() => {
    setRecent(getRecent());
    const cleanup = initInputQuantum(canvasRef.current, inputRef.current);
    return cleanup;
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const username = value.trim().replace(/^@/, "");
    if (!username) {
      setHint("Please enter a GitHub callsign / username.");
      return;
    }
    setHint("");
    addRecent(username);
    setRecent(getRecent());
    onSearch(username);
  }

  function triggerChip(username) {
    setValue(username);
    setHint("");
    addRecent(username);
    setRecent(getRecent());
    onSearch(username);
  }

  return (
    <>
      <form className="scout-form" onSubmit={handleSubmit} autoComplete="off" id="searchForm">
        <div className="input-lightning-wrap">
          <canvas className="input-lightning-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="scout-input-wrap">
            <span className="input-pokeball">🛸</span>
            <input
              ref={inputRef}
              className="scout-input"
              id="githubInput"
              type="text"
              placeholder="enter GitHub callsign or username…"
              spellCheck="false"
              maxLength={39}
              aria-label="GitHub username"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="scout-btn" type="submit" id="generateBtn">
              WARP JUMP&nbsp;→
            </button>
          </div>
        </div>
        {hint && <p className="input-hint">{hint}</p>}
      </form>

      {/* Quick scout examples */}
      <div className="quick-examples">
        <span className="qe-label">Scout:</span>
        {["torvalds", "sindresorhus", "gaearon", "shadcn"].map((u) => (
          <button key={u} className="example-chip qe-chip" onClick={() => triggerChip(u)}>
            {u}
          </button>
        ))}
      </div>

      {/* Live Counter Bar */}
      <div className="counter-bar">
        <span className="counter-dot" style={{ opacity: counterLoading ? 0.4 : 1 }} />
        <span className="counter-num">
          {counterLoading && count === null ? "…" : displayCount.toLocaleString()}
        </span>
        <span className="counter-label">explorer cards forged</span>
        <span className="counter-sep">|</span>
        <span className="how-link">subspace grid live ✦</span>
      </div>

      {/* Recent expeditions */}
      {recent.length > 0 && (
        <div className="recent-wrap visible">
          <span className="recent-label">Recent Flights:</span>
          <div className="recent-chips">
            {recent.map((u) => (
              <button key={u} className="recent-chip" onClick={() => triggerChip(u)}>
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
