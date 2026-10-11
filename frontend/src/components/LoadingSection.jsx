import React, { useEffect, useRef, useState } from "react";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SensorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  );
}

function SatelliteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7 9 3 5 7l4 4" />
      <path d="m17 11 4 4-4 4-4-4" />
      <path d="m8 12 4 4" />
      <path d="m16 8-4-4" />
      <path d="M12 12l-7 7" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function PlanetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="6" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeLinecap="round" transform="rotate(-22 12 12)" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z" />
      <path d="M19 15l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" opacity="0.8" />
    </svg>
  );
}

const STEPS = [
  { id: "sensors",   label: "Initializing subspace sensors...",    icon: SensorIcon },
  { id: "telemetry", label: "Scanning GitHub orbital telemetry...", icon: SatelliteIcon },
  { id: "coords",    label: "Aligning star system coordinates...",  icon: PlanetIcon },
  { id: "card",      label: "Forging Explorer trading card...",     icon: SparkleIcon },
];

export default function LoadingSection({ active, previewMode = false }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps,  setDoneSteps]  = useState([]);

  /* ── Step sequencer ── */
  useEffect(() => {
    if (!active) return;
    setActiveStep(0);
    setDoneSteps([]);

    if (previewMode) {
      let current = 0;
      const interval = setInterval(() => {
        current = (current + 1) % 5;
        if (current === 0) {
          setActiveStep(0);
          setDoneSteps([]);
        } else if (current === 1) {
          setDoneSteps([0]);
          setActiveStep(1);
        } else if (current === 2) {
          setDoneSteps([0, 1]);
          setActiveStep(2);
        } else if (current === 3) {
          setDoneSteps([0, 1, 2]);
          setActiveStep(3);
        } else {
          setDoneSteps([0, 1, 2, 3]);
          setActiveStep(4);
        }
      }, 1600);
      return () => clearInterval(interval);
    }

    const t = [
      setTimeout(() => { setDoneSteps([0]);       setActiveStep(1); }, 750),
      setTimeout(() => { setDoneSteps([0, 1]);    setActiveStep(2); }, 1550),
      setTimeout(() => { setDoneSteps([0, 1, 2]);  setActiveStep(3); }, 2350),
    ];
    return () => t.forEach(clearTimeout);
  }, [active, previewMode]);

  /* ── Cinematic Space Canvas (Stars + Earth Horizon + Asteroids) ── */
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;

    const setupCanvas = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };
    setupCanvas();

    const onResize = () => {
      setupCanvas();
    };
    window.addEventListener("resize", onResize);

    /* ── Twinkling Stars ── */
    const STAR_COUNT = Math.min(240, Math.floor((W * H) / 4500));
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.4 + Math.random() * 1.5,
      alpha: 0.25 + Math.random() * 0.75,
      speed: 0.003 + Math.random() * 0.009,
      phase: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.8
          ? Math.random() > 0.5
            ? "#38bdf8"
            : "#a78bfa"
          : "#ffffff",
    }));

    /* ── Shooting Stars / Telemetry Streaks ── */
    const shooters = [];
    let shootTimer = 0;
    function spawnShooter() {
      shooters.push({
        x: Math.random() * W * 0.8,
        y: Math.random() * H * 0.4,
        vx: 8 + Math.random() * 9,
        vy: 3 + Math.random() * 4,
        len: 100 + Math.random() * 140,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25,
      });
    }

    /* ── Floating Asteroids / Space Rocks ── */
    const rockDefs = [
      { xRel: 0.07, yRel: 0.72, r: 24, vx: 0.04,  vy: -0.02, rot: 0, rotSpeed: 0.002, blur: 3 },
      { xRel: 0.03, yRel: 0.46, r: 16, vx: 0.02,  vy: 0.03,  rot: 1, rotSpeed: -0.003, blur: 2 },
      { xRel: 0.12, yRel: 0.88, r: 38, vx: -0.03, vy: -0.01, rot: 2, rotSpeed: 0.001, blur: 5 },
      { xRel: 0.26, yRel: 0.84, r: 14, vx: 0.03,  vy: -0.02, rot: 0.5, rotSpeed: 0.004, blur: 1 },
      { xRel: 0.74, yRel: 0.90, r: 28, vx: -0.02, vy: -0.03, rot: 3, rotSpeed: -0.002, blur: 4 },
      { xRel: 0.94, yRel: 0.24, r: 18, vx: -0.03, vy: 0.02,  rot: 4, rotSpeed: 0.003, blur: 2 },
      { xRel: 0.88, yRel: 0.76, r: 20, vx: 0.02,  vy: -0.01, rot: 5, rotSpeed: -0.002, blur: 3 },
    ];

    const rocks = rockDefs.map((def) => {
      const pts = [];
      const numPts = 7;
      for (let i = 0; i < numPts; i++) {
        const angle = (i / numPts) * Math.PI * 2;
        const dist = def.r * (0.75 + Math.random() * 0.5);
        pts.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
      }
      return {
        ...def,
        pts,
        x: def.xRel * W,
        y: def.yRel * H,
      };
    });

    /* ── City light clusters on Earth ── */
    const cityLights = Array.from({ length: 90 }, () => ({
      angle: 0.12 + Math.random() * 0.76,
      depth: 0.02 + Math.random() * 0.15,
      intensity: 0.35 + Math.random() * 0.65,
      pulseSpeed: 0.012 + Math.random() * 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      size: 1.2 + Math.random() * 2.2,
      color: Math.random() > 0.3 ? "#f59e0b" : "#fbbf24",
    }));

    let frame = 0;

    function draw() {
      frame++;

      /* 1. Deep Space Gradient */
      const spaceGrad = ctx.createLinearGradient(0, 0, W, H);
      spaceGrad.addColorStop(0, "#020409");
      spaceGrad.addColorStop(0.4, "#04091a");
      spaceGrad.addColorStop(0.85, "#030612");
      spaceGrad.addColorStop(1, "#020308");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, W, H);

      /* 2. Ambient Cosmic Nebulae */
      const nViolet = ctx.createRadialGradient(W * 0.12, H * 0.15, 0, W * 0.12, H * 0.15, W * 0.44);
      nViolet.addColorStop(0, "rgba(99, 102, 241, 0.22)");
      nViolet.addColorStop(0.45, "rgba(79, 70, 229, 0.08)");
      nViolet.addColorStop(1, "transparent");
      ctx.fillStyle = nViolet;
      ctx.fillRect(0, 0, W, H);

      const nCyan = ctx.createRadialGradient(W * 0.5, H * 0.95, 0, W * 0.5, H * 0.95, W * 0.68);
      nCyan.addColorStop(0, "rgba(14, 165, 233, 0.18)");
      nCyan.addColorStop(0.5, "rgba(2, 132, 199, 0.06)");
      nCyan.addColorStop(1, "transparent");
      ctx.fillStyle = nCyan;
      ctx.fillRect(0, 0, W, H);

      /* 3. Twinkling Stars */
      for (const s of stars) {
        const twinkle = s.alpha * (0.65 + 0.35 * Math.sin(frame * s.speed + s.phase));
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* 4. Shooting Stars */
      shootTimer++;
      if (shootTimer > 80 + Math.random() * 50) {
        spawnShooter();
        shootTimer = 0;
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        s.alpha = 1 - s.life / s.maxLife;
        if (s.alpha <= 0) {
          shooters.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - (s.vx / 8) * s.len,
          s.y - (s.vy / 8) * s.len
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        grad.addColorStop(0.4, `rgba(56, 189, 248, ${s.alpha * 0.85})`);
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - (s.vx / 8) * s.len, s.y - (s.vy / 8) * s.len);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      /* 5. Curved Earth Horizon at Bottom (Matching Reference Image) */
      const earthRadius = Math.max(W * 0.88, 850);
      const earthCenterX = W * 0.52;
      const earthCenterY = H + earthRadius - Math.min(H * 0.22, 180);

      // Atmospheric outer glow
      ctx.save();
      const atmoGlow = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 10,
        earthCenterX,
        earthCenterY,
        earthRadius + 48
      );
      atmoGlow.addColorStop(0, "rgba(56, 189, 248, 0.48)");
      atmoGlow.addColorStop(0.35, "rgba(38, 150, 240, 0.22)");
      atmoGlow.addColorStop(0.75, "rgba(14, 116, 144, 0.08)");
      atmoGlow.addColorStop(1, "transparent");

      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 48, 0, Math.PI * 2);
      ctx.fill();

      // Earth body (Dark oceanic silhouette)
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      const earthGrad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY - earthRadius * 0.9,
        0,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      earthGrad.addColorStop(0, "#0a1733");
      earthGrad.addColorStop(0.3, "#040916");
      earthGrad.addColorStop(1, "#020409");
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Sharp glowing atmospheric rim stroke
      ctx.strokeStyle = "rgba(125, 211, 252, 0.78)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Shimmering night city clusters on Earth
      for (const city of cityLights) {
        const angle = Math.PI + city.angle * Math.PI;
        const r = earthRadius * (1 - city.depth);
        const cx = earthCenterX + Math.cos(angle) * r;
        const cy = earthCenterY + Math.sin(angle) * r;

        if (cy >= H * 0.75 && cy <= H + 20 && cx >= 0 && cx <= W) {
          const pulse =
            city.intensity * (0.6 + 0.4 * Math.sin(frame * city.pulseSpeed + city.pulsePhase));
          ctx.globalAlpha = pulse;
          ctx.fillStyle = city.color;
          ctx.beginPath();
          ctx.arc(cx, cy, city.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      /* 6. Floating Space Rocks / Asteroids */
      ctx.save();
      for (const rk of rocks) {
        rk.rot += rk.rotSpeed;
        rk.x += rk.vx;
        rk.y += rk.vy;

        if (rk.x < -60) rk.x = W + 50;
        if (rk.x > W + 60) rk.x = -50;
        if (rk.y < -60) rk.y = H + 50;
        if (rk.y > H + 60) rk.y = -50;

        ctx.save();
        ctx.translate(rk.x, rk.y);
        ctx.rotate(rk.rot);

        ctx.beginPath();
        rk.pts.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        const rockGrad = ctx.createLinearGradient(-rk.r, -rk.r, rk.r, rk.r);
        rockGrad.addColorStop(0, "rgba(55, 65, 81, 0.75)");
        rockGrad.addColorStop(0.5, "rgba(31, 41, 55, 0.85)");
        rockGrad.addColorStop(1, "rgba(17, 24, 39, 0.95)");
        ctx.fillStyle = rockGrad;
        ctx.fill();

        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <section className="ls-root" id="loadingSection" aria-label="Launching Mission Loading Screen">
      {/* ── Background Canvas ── */}
      <canvas ref={canvasRef} className="ls-canvas" aria-hidden="true" />

      {/* ── Main Container (Side-by-side on desktop, cleanly fitted on mobile) ── */}
      <div className="ls-container">
        {/* ── Left Column: Telemetry & Mission Checklist ── */}
        <div className="ls-left-column">
          {/* Mission Sub-header / Status Badge */}
          <div className="ls-badge-row">
            <span className="ls-telemetry-badge">
              <span className="ls-live-dot" />
              ORBITAL TELEMETRY SCAN
            </span>
            <span className="ls-system-code">SYS-09 // LAT-ALPHA</span>
          </div>

          {/* Main Title */}
          <div className="ls-title-block">
            <h1 className="ls-main-title">
              <span className="ls-word-launch">LAUNCHING</span>
              <span className="ls-word-mission">MISSION</span>
            </h1>
            <p className="ls-tagline">Scanning the cosmos for your GitHub profile...</p>
          </div>

          {/* Steps Checklist */}
          <ol className="ls-steps-list" aria-label="Orbital Scan Progress">
            {STEPS.map(({ id, label, icon: IconComponent }, i) => {
              const isDone   = doneSteps.includes(i);
              const isActive = activeStep === i;
              const isPending = !isDone && !isActive;

              return (
                <li
                  key={id}
                  className={[
                    "ls-step-card",
                    isDone   ? "ls-step-card--done"   : "",
                    isActive ? "ls-step-card--active" : "",
                    isPending ? "ls-step-card--pending" : "",
                  ]
                    .join(" ")
                    .trim()}
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Clean icon (No bulky background circle, matching reference image) */}
                  <div className="ls-step-icon">
                    {isDone ? (
                      <CheckIcon />
                    ) : (
                      <IconComponent />
                    )}
                  </div>

                  {/* Label */}
                  <span className="ls-step-text">{label}</span>

                  {/* Active cursor/pulse if currently scanning */}
                  {isActive && (
                    <div className="ls-step-status" aria-hidden="true">
                      <span className="ls-cursor-bar" />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Right Column: The Reaching Astronaut ── */}
        <div className="ls-right-column" aria-hidden="true">
          <div className="ls-astronaut-stage">
            {/* Tech Radar Rings */}
            <div className="ls-radar-ring ls-radar-ring-1" />
            <div className="ls-radar-ring ls-radar-ring-2" />
            <div className="ls-radar-ring ls-radar-ring-3" />

            {/* Ambient Visor & Suit Core Glow */}
            <div className="ls-core-glow" />

            {/* Astronaut Cutout Image (Reaching toward the viewer) */}
            <img
              src="/astronaut-reaching.png"
              alt="Astronaut floating in zero gravity reaching towards viewer"
              className="ls-astro-cutout"
              draggable="false"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
