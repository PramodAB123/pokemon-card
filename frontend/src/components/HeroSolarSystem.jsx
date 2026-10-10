import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const PLANETS = [
  {
    id: "prime",
    name: "Prime",
    color: "#E2A03A",
    shadow: "#5C2E08",
    glow: "rgba(226, 160, 58, 0.65)",
    radius: 7.2,
    orbit: 62,
    speed: 0.016,
    angle: 0.9,
    kind: "rock",
    typeTag: "Terrestrial",
    lore: "Warm inner world bathed in intense solar radiance.",
    au: "0.4 AU",
  },
  {
    id: "quantum",
    name: "Quantum",
    color: "#7EB8D4",
    shadow: "#163044",
    glow: "rgba(126, 184, 212, 0.6)",
    radius: 9.5,
    orbit: 102,
    speed: 0.011,
    angle: 2.35,
    kind: "ice",
    typeTag: "Glacial Oasis",
    hasMoon: true,
    moonR: 2.2,
    moonOrbit: 18,
    moonSpeed: 0.042,
    lore: "Pale ice world with delicate nitrogen auroras.",
    au: "0.9 AU",
  },
  {
    id: "crimson",
    name: "Crimson",
    color: "#C45C4A",
    shadow: "#3A1510",
    glow: "rgba(196, 92, 74, 0.55)",
    radius: 8.5,
    orbit: 144,
    speed: 0.0078,
    angle: 4.15,
    kind: "rock",
    typeTag: "Iron Desert",
    lore: "Canyon-carved red sands and rich mineral outposts.",
    au: "1.5 AU",
  },
  {
    id: "prism",
    name: "Prism",
    color: "#4A9E8E",
    shadow: "#12332C",
    glow: "rgba(74, 158, 142, 0.55)",
    radius: 17,
    orbit: 196,
    speed: 0.0048,
    angle: 1.15,
    kind: "gas",
    typeTag: "Ringed Giant",
    bands: ["#3D8A7C", "#5AAF9C", "#2F6F64", "#7BC4B2"],
    hasRings: true,
    ringInner: 23,
    ringOuter: 38,
    lore: "Majestic teal giant encircled by crystalline ice rings.",
    au: "3.2 AU",
  },
  {
    id: "nebula",
    name: "Nebula",
    color: "#7A6BB0",
    shadow: "#1E1638",
    glow: "rgba(122, 107, 176, 0.55)",
    radius: 13.5,
    orbit: 246,
    speed: 0.0034,
    angle: 3.6,
    kind: "gas",
    typeTag: "Storm Sphere",
    bands: ["#6A5BA0", "#8B7CC4", "#534680", "#9A8AD4"],
    hasMoon: true,
    moonR: 2.4,
    moonOrbit: 22,
    moonSpeed: 0.028,
    lore: "Swirling violet typhoons and perpetual magnetic storms.",
    au: "5.4 AU",
  },
  {
    id: "titanium",
    name: "Titanium",
    color: "#9AA3B2",
    shadow: "#2A3038",
    glow: "rgba(154, 163, 178, 0.45)",
    radius: 6.2,
    orbit: 284,
    speed: 0.0022,
    angle: 5.55,
    kind: "rock",
    typeTag: "Outer Sentinel",
    lore: "Cold dwarf world at the fringe of the solar wind.",
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
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");

    let width = wrap.clientWidth || 640;
    let height = wrap.clientHeight || 580;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sim = PLANETS.map((p) => ({
      ...p,
      angle: p.angle,
      moonAngle: Math.random() * Math.PI * 2,
    }));

    // Twinkling stars with 3D parallax depth
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.25 + 0.25,
      a: 0.18 + Math.random() * 0.55,
      tw: Math.random() * Math.PI * 2,
      depth: 0.15 + Math.random() * 0.85,
    }));

    // Asteroid belt dust between Crimson (144) and Prism (196)
    const dust = Array.from({ length: 110 }, () => ({
      radius: 164 + Math.random() * 22,
      angle: Math.random() * Math.PI * 2,
      size: 0.5 + Math.random() * 1.1,
      speed: 0.0035 + Math.random() * 0.003,
      a: 0.14 + Math.random() * 0.32,
    }));

    const meteor = { t: 180, x: 0, y: 0, vx: 0, vy: 0, trail: [] };

    function resize() {
      const rect = wrap.getBoundingClientRect();
      width = Math.round(rect.width) || 640;
      height = Math.round(rect.height) || 580;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resize());
      ro.observe(wrap);
    } else {
      window.addEventListener("resize", resize);
    }

    function drawSun(cx, cy, tick, scale) {
      const pulse = Math.sin(tick * 0.016) * 4;
      const sunR = Math.max(18, 23 * Math.min(scale, 1.25));

      // Deep atmospheric corona glow
      const haloR = (135 + pulse) * scale;
      const halo = ctx.createRadialGradient(cx, cy, sunR * 0.4, cx, cy, haloR);
      halo.addColorStop(0, "rgba(255, 232, 160, 0.65)");
      halo.addColorStop(0.18, "rgba(255, 175, 70, 0.35)");
      halo.addColorStop(0.42, "rgba(255, 120, 38, 0.12)");
      halo.addColorStop(0.72, "rgba(245, 158, 11, 0.03)");
      halo.addColorStop(1, "rgba(255, 80, 20, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fill();

      // Outer golden solar flare ring
      const flare = ctx.createRadialGradient(cx, cy, sunR * 0.8, cx, cy, sunR * 2.2);
      flare.addColorStop(0, "rgba(255, 200, 80, 0.4)");
      flare.addColorStop(0.5, "rgba(245, 140, 20, 0.15)");
      flare.addColorStop(1, "rgba(220, 70, 10, 0)");
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent solar photosphere core
      const core = ctx.createRadialGradient(cx - sunR * 0.28, cy - sunR * 0.32, 1, cx, cy, sunR);
      core.addColorStop(0, "#FFFDF5");
      core.addColorStop(0.32, "#FFE599");
      core.addColorStop(0.68, "#F59E0B");
      core.addColorStop(0.92, "#D97706");
      core.addColorStop(1, "#92400E");

      ctx.save();
      ctx.shadowColor = "rgba(255, 180, 60, 0.95)";
      ctx.shadowBlur = 28 * scale;
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Slow rotating solar granules / magnetic sunspots
      const spotAngle = tick * 0.003;
      const s1x = cx + Math.cos(spotAngle) * (sunR * 0.42);
      const s1y = cy + Math.sin(spotAngle) * (sunR * 0.28);
      const s2x = cx + Math.cos(spotAngle + 2.4) * (sunR * 0.52);
      const s2y = cy + Math.sin(spotAngle + 2.4) * (sunR * 0.35);

      ctx.fillStyle = "rgba(180, 83, 9, 0.32)";
      ctx.beginPath();
      ctx.arc(s1x, s1y, 2.5 * scale, 0, Math.PI * 2);
      ctx.arc(s2x, s2y, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawRing(px, py, inner, outer, front, ringTilt = 0.44) {
      ctx.save();
      ctx.translate(px, py);
      ctx.beginPath();
      const clipHeight = (outer + 6) * 1.5;
      const clipWidth = (outer + 6) * 2;
      ctx.rect(-clipWidth / 2, front ? -1 : -clipHeight, clipWidth, clipHeight);
      ctx.clip();
      ctx.rotate(ringTilt);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, Math.PI * 2);
      ctx.arc(0, 0, inner, 0, Math.PI * 2, true);

      const rg = ctx.createLinearGradient(-outer, 0, outer, 0);
      rg.addColorStop(0, "rgba(180, 225, 215, 0.08)");
      rg.addColorStop(0.35, "rgba(220, 242, 235, 0.55)");
      rg.addColorStop(0.5, "rgba(120, 185, 170, 0.25)");
      rg.addColorStop(0.65, "rgba(220, 242, 235, 0.55)");
      rg.addColorStop(1, "rgba(180, 225, 215, 0.08)");
      ctx.fillStyle = rg;
      ctx.fill("evenodd");

      // Delicate Cassini gap line
      ctx.beginPath();
      ctx.arc(0, 0, (inner + outer) * 0.52, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(10, 20, 25, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    function drawPlanet(p, px, py, cx, cy, dim, scale) {
      const r = Math.max(5, p.radius * Math.min(Math.max(scale, 0.8), 1.25));
      ctx.save();
      ctx.globalAlpha = dim ? 0.32 : 1;

      // Atmospheric outer glow
      const atmos = ctx.createRadialGradient(px, py, r * 0.6, px, py, r * 2.5);
      atmos.addColorStop(0, p.glow);
      atmos.addColorStop(1, "transparent");
      ctx.fillStyle = atmos;
      ctx.beginPath();
      ctx.arc(px, py, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Back half of planetary rings (behind sphere)
      if (p.hasRings) {
        drawRing(px, py, p.ringInner * scale, p.ringOuter * scale, false);
      }

      // 3D Spherical shading facing the Sun
      const toSun = Math.atan2(cy - py, cx - px);
      const lx = px + Math.cos(toSun) * r * 0.42;
      const ly = py + Math.sin(toSun) * r * 0.42;

      const sphere = ctx.createRadialGradient(lx, ly, r * 0.08, px, py, r);
      sphere.addColorStop(0, mix(p.color, 0.6));
      sphere.addColorStop(0.38, p.color);
      sphere.addColorStop(0.78, p.shadow);
      sphere.addColorStop(1, "#05070d");

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = sphere;
      ctx.fill();

      // Gas giant cloud bands
      if (p.kind === "gas" && p.bands) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = dim ? 0.2 : 0.35;
        p.bands.forEach((band, i) => {
          const y = py - r + (i + 0.5) * ((r * 2) / p.bands.length);
          ctx.fillStyle = band;
          ctx.fillRect(px - r, y, r * 2, r * 0.32);
        });
        ctx.restore();
      }

      // Ice world polar cap
      if (p.kind === "ice") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.ellipse(px, py - r * 0.55, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Specular limb glint
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
      ctx.beginPath();
      ctx.ellipse(lx - r * 0.05, ly - r * 0.05, r * 0.25, r * 0.16, toSun, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // Front half of planetary rings (in front of sphere)
      if (p.hasRings) {
        drawRing(px, py, p.ringInner * scale, p.ringOuter * scale, true);
      }

      // Natural satellite (moon)
      if (p.hasMoon) {
        p.moonAngle += p.moonSpeed;
        const moonOrb = p.moonOrbit * scale;
        const mx = px + Math.cos(p.moonAngle) * moonOrb;
        const my = py + Math.sin(p.moonAngle) * moonOrb * 0.52;
        const moonRad = Math.max(1.6, p.moonR * scale);

        ctx.fillStyle = dim ? "rgba(226, 232, 240, 0.35)" : "#E2E8F0";
        ctx.beginPath();
        ctx.arc(mx, my, moonRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Active hover halo indicator
      if (!dim && hoverRef.current === p.id) {
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, r + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    let tick = 0;

    function loop() {
      tick += 1;
      const tilt = tiltRef.current;
      tilt.x += (tilt.tx - tilt.x) * 0.08;
      tilt.y += (tilt.ty - tilt.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // System extent calibration:
      // Outer orbit is Titanium (284). With planet radius, rings, callout padding, ~315 radius.
      const maxExtent = 308;
      const padX = 28;
      const padY = 24;
      const squash = 0.65 + tilt.y * 0.07;

      // Scale dynamically so the solar system naturally fills the stage with generous presence
      const scaleX = (width * 0.5 - padX) / maxExtent;
      const scaleY = (height * 0.5 - padY) / (maxExtent * squash);
      const scale = Math.min(scaleX, scaleY);

      const cx = width / 2 + tilt.x * 24;
      const cy = height / 2 + tilt.y * 14;

      // Background stars with interactive 3D parallax
      stars.forEach((s) => {
        const tw = 0.5 + Math.sin(tick * 0.025 + s.tw) * 0.5;
        const sx = s.x * width + tilt.x * s.depth * 20;
        const sy = s.y * height + tilt.y * s.depth * 14;
        ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const active = hoverRef.current;

      // Orbital tracks
      sim.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.orbit * scale, p.orbit * scale * squash, 0, 0, Math.PI * 2);
        if (active === p.id) {
          ctx.strokeStyle = p.glow;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.stroke();
        } else {
          ctx.strokeStyle = active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.085)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Asteroid belt dust particles
      dust.forEach((d) => {
        d.angle += d.speed * 0.35;
        const ax = cx + Math.cos(d.angle) * d.radius * scale;
        const ay = cy + Math.sin(d.angle) * d.radius * scale * squash;
        ctx.fillStyle = active ? `rgba(200, 214, 230, ${d.a * 0.4})` : `rgba(200, 214, 230, ${d.a})`;
        ctx.fillRect(ax, ay, d.size * scale, d.size * scale);
      });

      // Periodic shooting star
      meteor.t -= 1;
      if (meteor.t <= 0 && meteor.trail.length === 0) {
        meteor.x = width * (0.08 + Math.random() * 0.4);
        meteor.y = height * (0.06 + Math.random() * 0.2);
        meteor.vx = 3.6 + Math.random() * 1.2;
        meteor.vy = 1.5 + Math.random() * 0.7;
        meteor.trail = [];
        meteor.t = 420 + Math.random() * 380;
      }
      if (meteor.trail.length || meteor.t > 410) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.trail.push({ x: meteor.x, y: meteor.y });
        if (meteor.trail.length > 16) meteor.trail.shift();
        if (meteor.x > width + 50 || meteor.y > height + 50) meteor.trail = [];
        meteor.trail.forEach((pt, i) => {
          const pct = i / meteor.trail.length;
          ctx.fillStyle = `rgba(255, 255, 255, ${pct * 0.35})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pct * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Center Star (The Sun)
      drawSun(cx, cy, tick, scale);

      // Sort planets by Y position for authentic 3D depth occlusion
      const live = sim.map((p) => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.orbit * scale;
        const py = cy + Math.sin(p.angle) * p.orbit * scale * squash;
        posRef.current[p.id] = { x: px, y: py, r: p.radius * scale };
        return { p, px, py };
      }).sort((a, b) => a.py - b.py);

      live.forEach(({ p, px, py }) => {
        drawPlanet(p, px, py, cx, cy, active && active !== p.id, scale);
      });

      // Update callout coordinates
      if (active && calloutRef.current) {
        const pos = posRef.current[active];
        if (pos) {
          calloutRef.current.style.left = `${pos.x}px`;
          calloutRef.current.style.top = `${pos.y}px`;
          // If planet is near top boundary, flip tooltip down to prevent clipping
          if (pos.y < 120) {
            calloutRef.current.classList.add("is-flipped");
          } else {
            calloutRef.current.classList.remove("is-flipped");
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!hovered || !calloutRef.current) return;
    const pos = posRef.current[hovered.id];
    if (!pos) return;
    calloutRef.current.style.left = `${pos.x}px`;
    calloutRef.current.style.top = `${pos.y}px`;
    if (pos.y < 120) {
      calloutRef.current.classList.add("is-flipped");
    } else {
      calloutRef.current.classList.remove("is-flipped");
    }
  }, [hovered]);

  function pickPlanet(clientX, clientY) {
    if (!wrapRef.current) return null;
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let found = null;
    for (const p of PLANETS) {
      const pos = posRef.current[p.id];
      if (!pos) continue;
      if (Math.hypot(mx - pos.x, my - pos.y) < pos.r + 14) {
        found = p;
        break;
      }
    }
    return found;
  }

  function handlePointerMove(e) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    tiltRef.current.tx = (e.clientX - rect.left) / rect.width - 0.5;
    tiltRef.current.ty = (e.clientY - rect.top) / rect.height - 0.5;
    const found = pickPlanet(e.clientX, e.clientY);
    hoverRef.current = found?.id ?? null;
    setHovered((prev) => (prev?.id === found?.id ? prev : found));
  }

  function handlePointerLeave() {
    tiltRef.current.tx = 0;
    tiltRef.current.ty = 0;
    hoverRef.current = null;
    setHovered(null);
  }

  function handlePointerDown(e) {
    const found = pickPlanet(e.clientX, e.clientY);
    if (found) {
      hoverRef.current = found.id;
      setHovered(found);
    }
  }

  function onLegendEnter(planet) {
    hoverRef.current = planet.id;
    setHovered(planet);
  }

  function onLegendLeave() {
    hoverRef.current = null;
    setHovered(null);
  }

  function onLegendClick(planet) {
    if (hovered?.id === planet.id) {
      hoverRef.current = null;
      setHovered(null);
    } else {
      hoverRef.current = planet.id;
      setHovered(planet);
    }
  }

  return (
    <div
      className="hero-right hero-solar-system"
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="solar-stage"
        ref={wrapRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        aria-label="Interactive solar system"
      >
        <canvas className="solar-canvas" ref={canvasRef} />

        {hovered && (
          <div
            className="solar-callout"
            ref={calloutRef}
            style={{ borderColor: hovered.color + "66" }}
          >
            <div className="solar-callout-header">
              <span
                className="solar-callout-dot"
                style={{ background: hovered.color, boxShadow: `0 0 8px ${hovered.color}` }}
              />
              <span className="solar-callout-name">{hovered.name}</span>
              <span className="solar-callout-tag">{hovered.typeTag}</span>
            </div>
            <div className="solar-callout-meta">
              <span>{hovered.au}</span>
              <span>Orbit {(hovered.speed * 1000).toFixed(1)} km/s</span>
            </div>
            <p className="solar-callout-lore">{hovered.lore}</p>
          </div>
        )}
      </div>

      <div className="solar-legend-wrap">
        <ul className="solar-legend" aria-label="Worlds in this system">
          {PLANETS.map((p) => {
            const isActive = hovered?.id === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className={`solar-legend-item${isActive ? " is-active" : ""}`}
                  style={{
                    "--item-color": p.color,
                    "--item-glow": p.glow,
                  }}
                  onMouseEnter={() => onLegendEnter(p)}
                  onMouseLeave={onLegendLeave}
                  onFocus={() => onLegendEnter(p)}
                  onBlur={onLegendLeave}
                  onClick={() => onLegendClick(p)}
                >
                  <i style={{ background: p.color }} />
                  <span className="legend-planet-name">{p.name}</span>
                  <span className="legend-planet-au">{p.au}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
