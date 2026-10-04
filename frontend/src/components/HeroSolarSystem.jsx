import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const PLANETS = [
  {
    id: "prime",
    name: "Prime",
    color: "#E2A03A",
    shadow: "#5C2E08",
    glow: "rgba(226, 160, 58, 0.55)",
    radius: 6.5,
    orbit: 58,
    speed: 0.018,
    angle: 0.9,
    kind: "rock",
    lore: "Warm inner world. The first light after the star.",
    au: "0.4 AU",
  },
  {
    id: "quantum",
    name: "Quantum",
    color: "#7EB8D4",
    shadow: "#163044",
    glow: "rgba(126, 184, 212, 0.5)",
    radius: 8.5,
    orbit: 96,
    speed: 0.012,
    angle: 2.35,
    kind: "ice",
    hasMoon: true,
    moonR: 1.8,
    moonOrbit: 15,
    moonSpeed: 0.045,
    lore: "Pale ice world with a thin, quiet atmosphere.",
    au: "0.9 AU",
  },
  {
    id: "crimson",
    name: "Crimson",
    color: "#C45C4A",
    shadow: "#3A1510",
    glow: "rgba(196, 92, 74, 0.45)",
    radius: 7.5,
    orbit: 132,
    speed: 0.0085,
    angle: 4.15,
    kind: "rock",
    lore: "Dust and iron. A still, rusted outpost.",
    au: "1.5 AU",
  },
  {
    id: "prism",
    name: "Prism",
    color: "#4A9E8E",
    shadow: "#12332C",
    glow: "rgba(74, 158, 142, 0.45)",
    radius: 15,
    orbit: 178,
    speed: 0.0052,
    angle: 1.15,
    kind: "gas",
    bands: ["#3D8A7C", "#5AAF9C", "#2F6F64", "#7BC4B2"],
    hasRings: true,
    ringInner: 20,
    ringOuter: 32,
    lore: "A slow gas giant. Ice rings catch the starlight.",
    au: "3.2 AU",
  },
  {
    id: "nebula",
    name: "Nebula",
    color: "#7A6BB0",
    shadow: "#1E1638",
    glow: "rgba(122, 107, 176, 0.45)",
    radius: 12,
    orbit: 224,
    speed: 0.0036,
    angle: 3.6,
    kind: "gas",
    bands: ["#6A5BA0", "#8B7CC4", "#534680", "#9A8AD4"],
    hasMoon: true,
    moonR: 2.1,
    moonOrbit: 19,
    moonSpeed: 0.03,
    lore: "Violet storms. Auroras that never quite settle.",
    au: "5.4 AU",
  },
  {
    id: "titanium",
    name: "Titanium",
    color: "#9AA3B2",
    shadow: "#2A3038",
    glow: "rgba(154, 163, 178, 0.35)",
    radius: 5.2,
    orbit: 258,
    speed: 0.0024,
    angle: 5.55,
    kind: "rock",
    lore: "A cold dwarf at the edge of the wind.",
    au: "8.1 AU",
  },
];

function mix(hex, amt) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const t = amt > 0 ? 255 : 0;
  const p = Math.abs(amt);
  const rr = Math.round((t - r) * p + r);
  const gg = Math.round((t - g) * p + g);
  const bb = Math.round((t - b) * p + b);
  return `rgb(${rr},${gg},${bb})`;
}

export default function HeroSolarSystem() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const hoverRef = useRef(null);
  const posRef = useRef({});
  const calloutRef = useRef(null);
  const tiltRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 560;
    let height = 560;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sim = PLANETS.map((p) => ({
      ...p,
      angle: p.angle,
      moonAngle: Math.random() * Math.PI * 2,
    }));

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.2,
      a: 0.15 + Math.random() * 0.45,
      tw: Math.random() * Math.PI * 2,
    }));

    const dust = Array.from({ length: 90 }, () => ({
      radius: 150 + Math.random() * 16,
      angle: Math.random() * Math.PI * 2,
      size: 0.4 + Math.random() * 0.9,
      speed: 0.004 + Math.random() * 0.003,
      a: 0.12 + Math.random() * 0.28,
    }));

    const meteor = { t: 220, x: 0, y: 0, vx: 0, vy: 0, trail: [] };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || 560;
      height = rect.height || 560;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawSun(cx, cy, tick) {
      const pulse = Math.sin(tick * 0.012) * 3;

      const halo = ctx.createRadialGradient(cx, cy, 8, cx, cy, 118 + pulse);
      halo.addColorStop(0, "rgba(255, 214, 140, 0.55)");
      halo.addColorStop(0.18, "rgba(255, 170, 70, 0.28)");
      halo.addColorStop(0.45, "rgba(255, 120, 40, 0.08)");
      halo.addColorStop(1, "rgba(255, 80, 20, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, 118 + pulse, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(cx - 5, cy - 6, 1, cx, cy, 20);
      core.addColorStop(0, "#FFF7E6");
      core.addColorStop(0.35, "#FFE08A");
      core.addColorStop(0.72, "#F0A12A");
      core.addColorStop(1, "#C45A12");
      ctx.shadowColor = "rgba(255, 170, 60, 0.9)";
      ctx.shadowBlur = 22;
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(180, 80, 20, 0.28)";
      ctx.beginPath();
      ctx.arc(cx + 6, cy + 4, 2.4, 0, Math.PI * 2);
      ctx.arc(cx - 5, cy - 3, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawRing(px, py, inner, outer, front) {
      ctx.save();
      ctx.translate(px, py);
      ctx.beginPath();
      ctx.rect(-48, front ? -1 : -48, 96, 49);
      ctx.clip();
      ctx.rotate(0.42);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, Math.PI * 2);
      ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
      const rg = ctx.createLinearGradient(-outer, 0, outer, 0);
      rg.addColorStop(0, "rgba(210, 230, 220, 0.05)");
      rg.addColorStop(0.45, "rgba(220, 236, 226, 0.42)");
      rg.addColorStop(0.55, "rgba(160, 190, 175, 0.12)");
      rg.addColorStop(1, "rgba(210, 230, 220, 0.05)");
      ctx.fillStyle = rg;
      ctx.fill("evenodd");
      ctx.restore();
    }

    function drawPlanet(p, px, py, cx, cy, dim) {
      const r = p.radius;
      ctx.save();
      ctx.globalAlpha = dim ? 0.38 : 1;

      const atmos = ctx.createRadialGradient(px, py, r * 0.6, px, py, r * 2.4);
      atmos.addColorStop(0, p.glow);
      atmos.addColorStop(1, "transparent");
      ctx.fillStyle = atmos;
      ctx.beginPath();
      ctx.arc(px, py, r * 2.4, 0, Math.PI * 2);
      ctx.fill();

      if (p.hasRings) drawRing(px, py, p.ringInner, p.ringOuter, false);

      const toSun = Math.atan2(cy - py, cx - px);
      const lx = px + Math.cos(toSun) * r * 0.38;
      const ly = py + Math.sin(toSun) * r * 0.38;

      const sphere = ctx.createRadialGradient(lx, ly, r * 0.08, px, py, r);
      sphere.addColorStop(0, mix(p.color, 0.55));
      sphere.addColorStop(0.35, p.color);
      sphere.addColorStop(0.78, p.shadow);
      sphere.addColorStop(1, "#07080c");

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();

      if (p.kind === "gas" && p.bands) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = dim ? 0.2 : 0.28;
        p.bands.forEach((band, i) => {
          const y = py - r + (i + 0.6) * ((r * 2) / p.bands.length);
          ctx.fillStyle = band;
          ctx.fillRect(px - r, y, r * 2, r * 0.28);
        });
        ctx.restore();
      }

      if (p.kind === "ice") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.ellipse(px, py - r * 0.55, r * 0.55, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(lx - r * 0.05, ly - r * 0.05, r * 0.22, r * 0.14, toSun, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      if (p.hasRings) drawRing(px, py, p.ringInner, p.ringOuter, true);

      if (p.hasMoon) {
        p.moonAngle += p.moonSpeed;
        const mx = px + Math.cos(p.moonAngle) * p.moonOrbit;
        const my = py + Math.sin(p.moonAngle) * p.moonOrbit * 0.55;
        ctx.fillStyle = dim ? "rgba(226,232,240,0.35)" : "#D7DEE8";
        ctx.beginPath();
        ctx.arc(mx, my, p.moonR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!dim && hoverRef.current === p.id) {
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    let tick = 0;

    function loop() {
      tick += 1;
      const tilt = tiltRef.current;
      tilt.x += (tilt.tx - tilt.x) * 0.07;
      tilt.y += (tilt.ty - tilt.y) * 0.07;

      ctx.clearRect(0, 0, width, height);

      const scale = Math.min(width, height) / 560;
      const cx = width / 2 + tilt.x * 18;
      const cy = height / 2 + tilt.y * 10;
      const squash = 0.62 + tilt.y * 0.08;

      stars.forEach((s) => {
        const tw = 0.55 + Math.sin(tick * 0.02 + s.tw) * 0.45;
        ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      sim.forEach((p) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.orbit * scale, p.orbit * scale * squash, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      dust.forEach((d) => {
        d.angle += d.speed * 0.35;
        const ax = cx + Math.cos(d.angle) * d.radius * scale;
        const ay = cy + Math.sin(d.angle) * d.radius * scale * squash;
        ctx.fillStyle = `rgba(200, 208, 220, ${d.a})`;
        ctx.fillRect(ax, ay, d.size, d.size);
      });

      meteor.t -= 1;
      if (meteor.t <= 0 && meteor.trail.length === 0) {
        meteor.x = width * (0.1 + Math.random() * 0.4);
        meteor.y = height * (0.08 + Math.random() * 0.2);
        meteor.vx = 3.2 + Math.random();
        meteor.vy = 1.4 + Math.random() * 0.6;
        meteor.trail = [];
        meteor.t = 480 + Math.random() * 400;
      }
      if (meteor.trail.length || meteor.t > 470) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.trail.push({ x: meteor.x, y: meteor.y });
        if (meteor.trail.length > 14) meteor.trail.shift();
        if (meteor.x > width + 40 || meteor.y > height + 40) meteor.trail = [];
        meteor.trail.forEach((pt, i) => {
          const pct = i / meteor.trail.length;
          ctx.fillStyle = `rgba(255,255,255,${pct * 0.28})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pct * 1.4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      drawSun(cx, cy, tick);

      const live = sim.map((p) => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.orbit * scale;
        const py = cy + Math.sin(p.angle) * p.orbit * scale * squash;
        posRef.current[p.id] = { x: px, y: py, r: p.radius * scale };
        return { p, px, py };
      }).sort((a, b) => a.py - b.py);

      const active = hoverRef.current;
      live.forEach(({ p, px, py }) => {
        drawPlanet(p, px, py, cx, cy, active && active !== p.id);
      });

      if (active && calloutRef.current) {
        const pos = posRef.current[active];
        if (pos) {
          calloutRef.current.style.left = `${pos.x}px`;
          calloutRef.current.style.top = `${pos.y}px`;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!hovered || !calloutRef.current) return;
    const pos = posRef.current[hovered.id];
    if (!pos) return;
    calloutRef.current.style.left = `${pos.x}px`;
    calloutRef.current.style.top = `${pos.y}px`;
  }, [hovered]);

  function pickPlanet(e) {
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = null;
    for (const p of PLANETS) {
      const pos = posRef.current[p.id];
      if (!pos) continue;
      if (Math.hypot(mx - pos.x, my - pos.y) < pos.r + 12) {
        found = p;
        break;
      }
    }
    return found;
  }

  function onMove(e) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    tiltRef.current.tx = (e.clientX - rect.left) / rect.width - 0.5;
    tiltRef.current.ty = (e.clientY - rect.top) / rect.height - 0.5;
    const found = pickPlanet(e);
    hoverRef.current = found?.id ?? null;
    setHovered((prev) => (prev?.id === found?.id ? prev : found));
  }

  function onLeave() {
    tiltRef.current.tx = 0;
    tiltRef.current.ty = 0;
    hoverRef.current = null;
    setHovered(null);
  }

  function onLegendEnter(planet) {
    hoverRef.current = planet.id;
    setHovered(planet);
  }

  function onLegendLeave() {
    hoverRef.current = null;
    setHovered(null);
  }

  return (
    <div
      className="hero-right hero-solar-system"
      onMouseLeave={onLeave}
    >
      <div
        className="solar-stage"
        ref={wrapRef}
        onMouseMove={onMove}
        aria-label="Interactive solar system"
      >
        <canvas className="solar-canvas" ref={canvasRef} />

        {hovered && (
          <div className="solar-callout" ref={calloutRef}>
            <span className="solar-callout-name">{hovered.name}</span>
            <span className="solar-callout-meta">{hovered.au}</span>
            <span className="solar-callout-lore">{hovered.lore}</span>
          </div>
        )}
      </div>

      <ul className="solar-legend" aria-label="Worlds in this system">
        {PLANETS.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={`solar-legend-item${hovered?.id === p.id ? " is-active" : ""}`}
              onMouseEnter={() => onLegendEnter(p)}
              onMouseLeave={onLegendLeave}
              onFocus={() => onLegendEnter(p)}
              onBlur={onLegendLeave}
            >
              <i style={{ background: p.color }} />
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
