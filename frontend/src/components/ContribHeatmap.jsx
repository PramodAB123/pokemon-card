import React, { useEffect, useRef } from "react";

function buildHeatmapCells() {
  const WEEKS = 52,
    DAYS = 7;
  const cells = [];
  let streak = 0;
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const week = Math.floor(i / DAYS);
    const day = i % DAYS;
    const isWeekend = day === 0 || day === 6;
    const r = Math.sin(i * 127.1 + week * 311.7) * 0.5 + 0.5;
    const r2 = Math.sin(i * 43.7 + 91.3) * 0.5 + 0.5;
    let level = 0;
    if (r > (isWeekend ? 0.72 : 0.55)) {
      level = r2 > 0.8 ? 4 : r2 > 0.6 ? 3 : r2 > 0.35 ? 2 : 1;
      streak++;
    } else {
      streak = 0;
    }
    if (streak >= 3 && level > 0 && level < 4) level = Math.min(4, level + 1);
    cells.push(level);
  }
  // Reorder: week-column by week-column (GitHub style)
  const out = [];
  for (let col = 0; col < WEEKS; col++) {
    for (let row = 0; row < DAYS; row++) {
      out.push(cells[col * DAYS + row]);
    }
  }
  return out;
}

function initTelemetryBeams(canvas, grid) {
  if (!canvas || !grid) return () => {};

  function syncSize() {
    canvas.width = grid.offsetWidth;
    canvas.height = grid.offsetHeight;
  }
  syncSize();
  const ctx = canvas.getContext("2d");

  function getHotCells() {
    const cells = grid.querySelectorAll(".pb-cell.pb-4, .pb-cell.pb-3");
    if (!cells.length) return [];
    const gr = grid.getBoundingClientRect();
    return Array.from(cells).map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left - gr.left + r.width / 2, y: r.top - gr.top + r.height / 2 };
    });
  }

  function strike() {
    const hot = getHotCells();
    if (!hot.length) return;
    const target = hot[Math.floor(Math.random() * hot.length)];
    syncSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, 16);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
    grad.addColorStop(0.5, "rgba(129, 140, 248, 0.4)");
    grad.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(target.x, target.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    let opacity = 1;
    const fade = setInterval(() => {
      opacity -= 0.1;
      if (opacity <= 0) {
        clearInterval(fade);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.globalAlpha = opacity;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(target.x, target.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.globalAlpha = 1;
    }, 45);
  }

  window.addEventListener("resize", syncSize);
  const t1 = setTimeout(strike, 900);
  const iv = setInterval(() => {
    if (Math.random() > 0.4) strike();
  }, 2600);

  return () => {
    window.removeEventListener("resize", syncSize);
    clearTimeout(t1);
    clearInterval(iv);
  };
}

const CELLS = buildHeatmapCells();

export default function ContribHeatmap() {
  const canvasRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const cleanup = initTelemetryBeams(canvasRef.current, gridRef.current);
    return cleanup;
  }, []);

  return (
    <div className="contrib-heatmap" aria-hidden="true">
      <div className="heatmap-label-row">
        <span className="heatmap-label">📡 Subspace Orbit Telemetry</span>
        <span className="heatmap-subtitle">Past 52 cycles</span>
      </div>
      <div className="heatmap-canvas-wrap">
        <canvas className="lightning-canvas" ref={canvasRef} />
        <div className="heatmap-grid" ref={gridRef}>
          {CELLS.map((level, i) => (
            <div key={i} className={`pb-cell pb-${level}`}>
              <div className="pb-btn" />
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="legend-text">Standby</span>
        <div className="legend-balls">
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className={`pb-cell pb-${l}`} style={{ width: 12, height: 12, paddingBottom: 0 }}>
              <div className="pb-btn" style={{ position: "static", width: "100%", height: "100%" }} />
            </div>
          ))}
        </div>
        <span className="legend-text">Hyperdrive</span>
      </div>
    </div>
  );
}
