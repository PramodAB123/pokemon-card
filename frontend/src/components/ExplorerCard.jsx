import React from "react";
import { fmt } from "../lib/utils.js";

export default function ExplorerCard({ d }) {
  const sys = d.starSystem;
  const clr = d.clearance;
  const rank = d.fleetRank;
  const vuln = d.vulnInfo;

  return (
    <div
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
      {/* Clearance Holographic Foil Overlay (for Ultra & Black Ops) */}
      <div className="card-holo-shimmer" aria-hidden="true" />
      <div className="card-cyber-grid" aria-hidden="true" />

      <div className="explorer-frame">

        {/* ── 1. Header: Explorer, Shield, Rank & Clearance ── */}
        <div className="exp-header">
          <div className="exp-header-left">
            <div className="exp-callsign-row">
              <span className="exp-tag">EXPLORER</span>
              <span className="exp-username">{d.username}</span>
            </div>
            <div className="exp-name-sub">
              {d.displayName && d.displayName !== d.username ? d.displayName : "Deep Space Pilot"}
            </div>
          </div>

          <div className="exp-header-right">
            <div className="exp-shield-box">
              <span className="exp-shield-icon">🛡️</span>
              <div className="exp-shield-readout">
                <span className="exp-shield-label">SHIELD</span>
                <span className="exp-shield-val">{d.shield}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Telemetry Deck / Artwork HUD ── */}
        <div className="exp-art-bay">
          {/* Background Nebula & Grid */}
          <div className="exp-nebula-wash" />
          <div className="exp-radar-sweep" aria-hidden="true" />

          {/* Left: Avatar In Holographic Capsule */}
          <div className="exp-capsule-wrap">
            <div className="exp-capsule-ring-outer" />
            <div className="exp-capsule-ring-inner" />
            <div className="exp-avatar-lens">
              <img className="exp-avatar" src={d.avatarUrl} alt={d.username} loading="lazy" />
              <div className="exp-lens-glare" />
            </div>
            <div className="exp-hud-reticle" aria-hidden="true">
              <span className="reticle-corner tl" />
              <span className="reticle-corner tr" />
              <span className="reticle-corner bl" />
              <span className="reticle-corner br" />
            </div>
          </div>

          {/* Right: Rank & Clearance Info */}
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
            <span className="sys-marker">◆</span>
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
                <span className="move-ico">{ability.icon}</span>
                <span className="move-txt">{ability.name}</span>
              </div>
              <span className="move-leader" aria-hidden="true" />
              <div className="move-stat-wrap">
                <span className="move-cost-num">{ability.cost}</span>
                <span className="move-unit">{ability.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 5. Mission Points (MP) Reactor Gauge ── */}
        <div className="exp-mp-reactor">
          <div className="mp-header-row">
            <span className="mp-title">REACTOR CORE</span>
            <span className="mp-readout">
              MP: <strong className="mp-cur">{fmt(d.mp)}</strong> / {fmt(d.nextLvlTargetMP)}
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
            <div className="mp-segments-overlay" aria-hidden="true">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="mp-seg-notch" />
              ))}
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
