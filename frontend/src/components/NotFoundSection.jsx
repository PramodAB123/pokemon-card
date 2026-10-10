import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundSection({ username, onTryAnother }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let angle = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function loop() {
      angle += 0.022;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Concentric radar scan rings
      [40, 80, 120, 160].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.08 + i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - 170, cy);
      ctx.lineTo(cx + 170, cy);
      ctx.moveTo(cx, cy - 170);
      ctx.lineTo(cx, cy + 170);
      ctx.strokeStyle = "rgba(244, 63, 94, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sweeping radar beam
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const sweep = ctx.createRadialGradient(0, 0, 10, 0, 0, 160);
      sweep.addColorStop(0, "rgba(244, 63, 94, 0.35)");
      sweep.addColorStop(0.5, "rgba(244, 63, 94, 0.1)");
      sweep.addColorStop(1, "rgba(244, 63, 94, 0)");
      ctx.fillStyle = sweep;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 160, -0.35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Lost blip pulsating at random quadrant
      const bx = cx + Math.cos(angle * 0.35) * 95;
      const by = cy + Math.sin(angle * 0.35) * 60;
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fb7185";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  function handleGoHome() {
    if (onTryAnother) {
      onTryAnother();
    } else {
      navigate("/");
    }
  }

  return (
    <section className="not-found-section" id="notFoundSection">
      <div className="not-found-card">
        {/* Radar Scanner Visual */}
        <div className="not-found-radar-wrap">
          <canvas className="not-found-radar-canvas" ref={canvasRef} />
          <div className="radar-core-icon">🛸</div>
        </div>

        {/* Status Chip */}
        <div className="not-found-badge">
          <span className="badge-ping" />
          <span className="badge-label">SUBSPACE RADAR // ERROR 404</span>
        </div>

        {/* Headline */}
        <h1 className="not-found-headline">
          <span className="not-found-glitch" data-text="SIGNAL LOST">
            SIGNAL LOST
          </span>
          <span className="not-found-subhead">IN DEEP SPACE</span>
        </h1>

        {/* Telemetry Log */}
        <div className="not-found-dossier">
          <div className="dossier-row">
            <span className="dossier-key">SECTOR:</span>
            <span className="dossier-val text-rose">0x404 // UNCHARTED_VOID</span>
          </div>
          <div className="dossier-row">
            <span className="dossier-key">TARGET CALLSIGN:</span>
            <span className="dossier-val text-amber">
              {username ? `@${username}` : "COORDINATES_UNKNOWN"}
            </span>
          </div>
          <div className="dossier-row">
            <span className="dossier-key">TELEMETRY:</span>
            <span className="dossier-val">
              {username
                ? `Explorer callsign "@${username}" not located in the galactic GitHub registry.`
                : "The hyperspace jump coordinates lead to an uncharted cosmic vacuum."}
            </span>
          </div>
        </div>

        {/* Quick Scout Recovery Chips */}
        <div className="not-found-scout-chips">
          <span className="scout-chip-label">Known Active Beacons:</span>
          {["torvalds", "sindresorhus", "gaearon", "shadcn"].map((u) => (
            <button
              key={u}
              type="button"
              className="example-chip not-found-chip"
              onClick={() => navigate(`/${u}`)}
            >
              @{u}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="not-found-actions">
          <button
            type="button"
            className="action-btn primary not-found-primary-btn"
            onClick={handleGoHome}
            id="returnBridgeBtn"
          >
            ← RETURN TO COMMAND BRIDGE
          </button>
        </div>
      </div>
    </section>
  );
}
