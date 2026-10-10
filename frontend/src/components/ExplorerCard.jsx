import React, { useRef } from "react";
import { fmt } from "../lib/utils.js";

// Clean vector icons for abilities
function AbilityIcon({ type }) {
  switch (type) {
    case "Warp Commit":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "Orbital Deploy":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
        </svg>
      );
    case "Signal Broadcast":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
          <circle cx="12" cy="12" r="2" />
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
          <path d="M19.1 4.9c3.9 3.9 3.9 10.3 0 14.2" />
        </svg>
      );
    case "Deep Scan":
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    default:
      return <span>⚡</span>;
  }
}

export default function ExplorerCard({ d }) {
  const sys = d.starSystem;
  const clr = d.clearance;
  const rank = d.fleetRank;
  const vuln = d.vulnInfo;
  const cardRef = useRef(null);

  // 3D Parallax Tilt Effect on mouse hover
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`explorer-card ${clr.borderClass}`}
      id="generatedCard"
      style={{
        "--sys-color": sys.color,
        "--sys-light": sys.light,
        "--sys-dark": sys.dark,
        "--sys-accent": sys.accent,
        "--clr-glow": clr.glow,
        "--clr-color": clr.color,
      }}
    >
      {/* Dynamic Holographic Foil Overlay */}
      <div className="card-holo-shimmer" aria-hidden="true" />
      <div className="card-cyber-grid" aria-hidden="true" />

      <div className="explorer-frame">

        {/* ── 1. Header: Explorer, Shield, Rank ── */}
        <div className="exp-header">
          <div className="exp-header-left">
            <div className="exp-callsign-row">
              <span className="exp-tag">PILOT</span>
              <span className="exp-username">{d.username}</span>
            </div>
            <div className="exp-name-sub">
              {d.displayName && d.displayName !== d.username ? d.displayName : "Interstellar Explorer"}
            </div>
          </div>

          <div className="exp-header-right">
            <div className="exp-shield-box">
              <svg className="shield-svg-icon" width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div className="exp-shield-readout">
                <span className="exp-shield-label">SHIELD</span>
                <span className="exp-shield-val">{d.shield}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Telemetry Deck / Avatar HUD ── */}
        <div className="exp-art-bay">
          <div className="exp-nebula-wash" />

          {/* Avatar Lens Container (Single Clean Ring) */}
          <div className="exp-capsule-wrap">
            <div className="exp-avatar-lens">
              <img className="exp-avatar" src={d.avatarUrl} alt={d.username} loading="lazy" />
              <div className="exp-lens-glare" />
            </div>
          </div>

          {/* Dossier Data Column */}
          <div className="exp-dossier-col">
            <div className="exp-dossier-item">
              <span className="dossier-lbl">FLEET RANK</span>
              <div className="dossier-val-row">
                <span className="rank-insignia">{rank.badge}</span>
                <span className="rank-title">{rank.title}</span>
              </div>
            </div>

            <div className="exp-dossier-item">
              <span className="dossier-lbl">CLEARANCE</span>
              <div className="clearance-badge-pill" style={{ color: clr.color, borderColor: `${clr.color}66` }}>
                <span className="clearance-icon">{clr.badge}</span>
                <span className="clearance-name">{clr.label}</span>
              </div>
            </div>

            <div className="exp-dossier-item">
              <span className="dossier-lbl">VESSEL ID</span>
              <span className="vessel-id-num">{d.shipId}</span>
            </div>
          </div>
        </div>

        {/* ── 3. Star System Banner ── */}
        <div className="exp-system-band">
          <div className="exp-sys-left">
            <span className="sys-gem-icon">{sys.icon || "✦"}</span>
            <span className="sys-name">{sys.name.toUpperCase()} SYSTEM</span>
          </div>
          <div className="exp-sys-right">
            <span className="sys-lvl">LVL {d.level}</span>
          </div>
        </div>

        {/* ── 4. Mission Capabilities (Card Moves) ── */}
        <div className="exp-moves-deck">
          {d.abilities.map((ability, idx) => (
            <div className="exp-move-row" key={idx}>
              <div className="move-title-wrap">
                <div className="move-icon-badge">
                  <AbilityIcon type={ability.name} />
                </div>
                <span className="move-txt">{ability.name}</span>
              </div>
              <div className="move-stat-wrap">
                <span className="move-cost-num">{ability.cost}</span>
                <span className="move-unit">{ability.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 5. Mission Points (MP) Reactor Core ── */}
        <div className="exp-mp-reactor">
          <div className="mp-header-row">
            <span className="mp-title">REACTOR CORE</span>
            <span className="mp-readout">
              MP <strong className="mp-cur">{fmt(d.mp)}</strong> / {fmt(d.nextLvlTargetMP)}
            </span>
          </div>
          <div className="mp-gauge-track">
            <div
              className="mp-gauge-fill"
              style={{
                width: `${d.mpProgress}%`,
              }}
            >
              <div className="mp-sparkle" />
            </div>
          </div>
        </div>

        {/* ── 6. Subspace Telemetry Footer ── */}
        <div className="exp-telemetry-footer">
          <div className="footer-spec">
            <span className="spec-muted">VULN:</span>
            <span className="spec-weak" title={vuln.reason}>
              {vuln.weakTo.toUpperCase()}
            </span>
          </div>

          <div className="footer-spec center">
            <span className="spec-ship-id">{d.shipId}</span>
          </div>

          <div className="footer-spec end">
            <span className="spec-muted">COMMISSIONED</span>
            <span className="spec-year">{d.joinedYear}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
