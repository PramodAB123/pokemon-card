import React, { useState, useEffect } from "react";
import { LANG_COLORS, STAR_SYSTEMS } from "../lib/constants.js";
import { fmt, timeAgo } from "../lib/utils.js";
import { computeRepoLevel } from "../lib/computeCardData.js";

// Helper to sanitize common GitHub emoji shortcodes into live vibrant emojis
function parseGitHubEmojis(text) {
  if (!text) return "";
  const emojiMap = {
    zap: "⚡",
    fire: "🔥",
    rocket: "🚀",
    package: "📦",
    sparkles: "✨",
    bulb: "💡",
    tada: "🎉",
    star: "⭐",
    heart: "❤️",
    warning: "⚠️",
    bug: "🐛",
    books: "📚",
    art: "🎨",
    wrench: "🔧",
    hammer: "🔨",
    memo: "📝",
    link: "🔗",
    gem: "💎",
    crystal_ball: "🔮",
    robot: "🤖",
    shield: "🛡️",
    gear: "⚙️",
    lock: "🔒",
    key: "🔑",
    mag: "🔍",
  };
  return text.replace(/:([a-z0-9_+-]+):/gi, (match, code) => emojiMap[code.toLowerCase()] || match);
}

// Generate deterministic hex memory address for sci-fi telemetry
function getHexAddress(str, index) {
  let hash = index * 1337;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffff;
  }
  return hash.toString(16).toUpperCase().padStart(4, "0");
}

export default function ReposGrid({ d }) {
  // Mobile detection: Mobile devices strictly display the Tactical Matrix
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [viewMode, setViewMode] = useState("flowchart"); // "flowchart" | "matrix"
  const activeView = isMobile ? "matrix" : viewMode;
  const [hoveredNode, setHoveredNode] = useState(null);

  if (!d.topRepos || d.topRepos.length === 0) {
    return (
      <div className="repos-empty-schematic">
        <div className="empty-radar-ping">
          <span className="empty-radar-core">🛸</span>
        </div>
        <div className="empty-text-wrap">
          <span className="empty-title">SUBSPACE CONSTELLATION DORMANT</span>
          <span className="empty-sub">No orbital starbases deployed yet — every interstellar fleet starts with a single launch!</span>
        </div>
      </div>
    );
  }

  // Rank repositories by subspace telemetry score
  const scored = d.topRepos
    .map((r) => ({
      ...r,
      _score:
        (r.stargazers_count || 0) * 10 +
        (r.forks_count || 0) * 5 +
        (r._commitCount || 0) * 3 +
        (r.description ? 2 : 0) +
        (r.language ? 1 : 0),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  const maxScore = Math.max(...scored.map((r) => r._score), 1);
  const totalStars = scored.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = scored.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const avgIntegrity = Math.round(
    scored.reduce((acc, r) => acc + Math.max(18, Math.round((r._score / maxScore) * 100)), 0) / scored.length
  );

  // Divide scored nodes into 3 Flowchart Architecture Tiers
  // Tier 1: Flagship Ingress Node (1 node)
  const tier1 = scored.slice(0, 1);
  // Tier 2: Primary Core Processing Relays (2 nodes)
  const tier2 = scored.slice(1, 3);
  // Tier 3: Distributed Outpost Edge Satellites (up to 3 nodes)
  const tier3 = scored.slice(3, 6);

  function renderNodeCard(r, index, tierName, tierLevel) {
    const langColor = LANG_COLORS[r.language] || LANG_COLORS.default;
    const system = STAR_SYSTEMS[r.language] || STAR_SYSTEMS.default;
    const sizeSignal = Math.log2((r.size || 0) + 2);
    const commitSignal = r._commitCount || 0;
    const repoLevel = computeRepoLevel(commitSignal + Math.round(sizeSignal));
    const shieldPct = Math.max(18, Math.round((r._score / maxScore) * 100));
    const shieldColor = shieldPct > 65 ? "#00F0FF" : shieldPct > 35 ? "#F59E0B" : "#EC4899";
    const rawDesc = r.description || "Subspace beacon station with open telemetry telemetry.";
    const cleanDesc = parseGitHubEmojis(rawDesc);
    const hexAddr = getHexAddress(r.name, index);
    const isHovered = hoveredNode === index;

    // Segmented power cell calculation (5 LED segments)
    const activeSegments = Math.max(1, Math.ceil((shieldPct / 100) * 5));

    return (
      <div
        key={r.name}
        className={`starbase-node-card ${isHovered ? "is-node-active" : ""}`}
        style={{
          "--card-accent": system.color,
          "--accent-glow": `${system.color}33`,
        }}
        onMouseEnter={() => setHoveredNode(index)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {/* Top Flowchart Input Socket */}
        <div className="flow-socket socket-top" title={`Ingress Bus Port ${index + 1}`}>
          <div className="socket-pin" />
          <span className="socket-label">IN_BUS // 0{index + 1}</span>
        </div>

        {/* Card Holographic Container */}
        <a
          href={`https://github.com/${d.username}/${r.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="starbase-card-inner"
        >
          {/* Tech HUD Frame Accents */}
          <span className="hud-corner top-left" />
          <span className="hud-corner top-right" />
          <span className="hud-corner bottom-left" />
          <span className="hud-corner bottom-right" />

          {/* Node Schematic Header */}
          <div className="node-schematic-header">
            <div className="node-id-cluster">
              <span className="node-pulse-led" style={{ background: system.color }} />
              <span className="node-badge-text">NODE 0{index + 1}</span>
              <span className="node-tier-pill">{tierName}</span>
            </div>
            <div className="node-telemetry-stamp">
              <span className="hex-stamp">0x{hexAddr}</span>
              <span className="sector-tag">LVL {repoLevel}</span>
            </div>
          </div>

          {/* Holographic Quantum Gyroscope Scanner Visual */}
          <div
            className="starbase-gyro-bay"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${system.color}28 0%, ${system.dark}99 65%, #050b18 100%)`,
            }}
          >
            {/* Grid Crosshair Background */}
            <div className="gyro-grid-crosshair" />

            {/* Live Animated Gyroscope Rings */}
            <div className="gyro-assembly">
              {/* Outer Rotating Dotted Ring */}
              <div
                className="gyro-ring ring-outer"
                style={{ borderColor: `${system.color}66` }}
              />
              {/* Counter-Rotating Elliptic Planetary Orbit */}
              <div
                className="gyro-ring ring-mid"
                style={{ borderColor: system.light }}
              />
              {/* Radar Reticle Sweep Overlay */}
              <div className="gyro-sweep" />
              {/* Center Pulsing Quantum Starbase Core */}
              <div
                className="gyro-core"
                style={{
                  background: system.color,
                  boxShadow: `0 0 16px ${system.color}, 0 0 32px ${system.color}88`,
                }}
              >
                <span className="gyro-core-beacon" />
              </div>
            </div>

            {/* Status Beacon Bar */}
            <div className="gyro-hud-overlay">
              <span className="gyro-status-label">SYS_BEACON: ONLINE</span>
              <span className="gyro-scan-coords">{tierLevel}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="starbase-card-body">
            {/* Starbase Title */}
            <div className="starbase-title-row">
              <h4 className="starbase-name" title={r.name}>
                {r.name}
              </h4>
              <span className="starbase-link-icon">↗</span>
            </div>

            {/* Segmented Cybernetic Power / Integrity Meter */}
            <div className="cyber-integrity-meter">
              <div className="meter-header">
                <span className="meter-label">SHIELD INTEGRITY</span>
                <span className="meter-val" style={{ color: shieldColor }}>
                  {shieldPct}% {shieldPct > 65 ? "NOMINAL" : "STABLE"}
                </span>
              </div>
              <div className="meter-segments">
                {[1, 2, 3, 4, 5].map((seg) => (
                  <div
                    key={seg}
                    className={`meter-seg ${seg <= activeSegments ? "active" : ""}`}
                    style={{
                      "--seg-color": shieldColor,
                      "--seg-glow": `${shieldColor}aa`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sanitized Repository Description */}
            <p className="starbase-desc">{cleanDesc}</p>

            {/* Telemetry Metrics & Star System Footer */}
            <div className="starbase-footer">
              {r.language && (
                <span
                  className="starbase-lang-chip"
                  style={{
                    background: `${langColor}18`,
                    borderColor: `${langColor}55`,
                    color: langColor,
                  }}
                >
                  <span className="lang-pulse-dot" style={{ background: langColor }} />
                  {system.name} ({r.language})
                </span>
              )}
              {r.stargazers_count > 0 && (
                <span className="telemetry-pill">★ {fmt(r.stargazers_count)}</span>
              )}
              {r.forks_count > 0 && (
                <span className="telemetry-pill">🔀 {fmt(r.forks_count)}</span>
              )}
              {r._commitCount > 0 && (
                <span className="telemetry-pill commits-pulse">⚡ {r._commitCount} recent</span>
              )}
              {r._commitCount === 0 && r.stargazers_count === 0 && r.forks_count === 0 && r.updated_at && (
                <span className="telemetry-pill muted">Scanned {timeAgo(r.updated_at)}</span>
              )}
            </div>
          </div>
        </a>

        {/* Bottom Flowchart Output Socket */}
        <div className="flow-socket socket-bottom" title={`Egress Bus Port ${index + 1}`}>
          <span className="socket-label">OUT_BUS // STREAM</span>
          <div className="socket-pin" />
        </div>
      </div>
    );
  }

  return (
    <div className="starbase-flowchart-deck">
      {/* Top Professional Pipeline Header & HUD Control Ribbon */}
      <div className="flowchart-hud-banner">
        <div className="flowchart-banner-left">
          <div className="banner-title-line">
            <span className="hud-status-blinker" />
            <h3 className="flowchart-main-title">
              {isMobile
                ? "INTERSTELLAR STARBASE TACTICAL MATRIX"
                : "INTERSTELLAR STARBASE TOPOLOGY & DATA FLOWCHART"}
            </h3>
          </div>
          <p className="flowchart-sub-telemetry">
            {isMobile
              ? "TACTICAL 6-SECTOR MATRIX ARRAY // SUBSPACE DIRECTORY"
              : "QUANTUM REPOSITORY PIPELINE ARCHITECTURE // SUBSPACE DIRECTORY // FLEET PROTOCOL v4.8"}
          </p>
        </div>

        {/* Global Pipeline Telemetry Badges */}
        <div className="flowchart-banner-center">
          <div className="telemetry-stat-cell">
            <span className="stat-label">ONLINE NODES</span>
            <span className="stat-value">{scored.length} / 6</span>
          </div>
          <div className="telemetry-stat-divider" />
          <div className="telemetry-stat-cell">
            <span className="stat-label">FLEET INTEGRITY</span>
            <span className="stat-value cyan-glow">{avgIntegrity}%</span>
          </div>
          <div className="telemetry-stat-divider" />
          <div className="telemetry-stat-cell">
            <span className="stat-label">TOTAL STARS</span>
            <span className="stat-value amber-glow">★ {fmt(totalStars)}</span>
          </div>
          <div className="telemetry-stat-divider" />
          <div className="telemetry-stat-cell">
            <span className="stat-label">TOTAL FORKS</span>
            <span className="stat-value purple-glow">🔀 {fmt(totalForks)}</span>
          </div>
        </div>

        {/* View Switcher: Interactive Flowchart vs Matrix Grid (Desktop only) */}
        {!isMobile && (
          <div className="flowchart-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${activeView === "flowchart" ? "active" : ""}`}
              onClick={() => setViewMode("flowchart")}
              title="Display interconnected schematic pipeline flowchart"
            >
              <span className="toggle-icon">☵</span>
              <span className="toggle-text">SCHEMATIC FLOW</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${activeView === "matrix" ? "active" : ""}`}
              onClick={() => setViewMode("matrix")}
              title="Display tactical 6-sector matrix array"
            >
              <span className="toggle-icon">⊞</span>
              <span className="toggle-text">TACTICAL MATRIX</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: INTERACTIVE SCHEMATIC FLOWCHART (Desktop) or VIEW MODE 2: TACTICAL MATRIX GRID */}
      {activeView === "flowchart" ? (
        <div className="schematic-flowchart-canvas">
          {/* ════ STAGE 01: COMMAND HUB (FLAGSHIP INGRESS) ════ */}
          <div className="flowchart-stage stage-tier-1">
            <div className="stage-header-ribbon">
              <span className="stage-index">STAGE 01</span>
              <span className="stage-name">INGRESS & COMMAND FLAGSHIP HUB</span>
              <span className="stage-flow-indicator">PRIMARY ORIGIN // 100% BANDWIDTH</span>
            </div>
            <div className="tier-nodes-row tier-single">
              {tier1.map((r, i) => renderNodeCard(r, i, "COMMAND HUB", "TIER-1 FLAGSHIP"))}
            </div>
          </div>

          {/* ════ CONDUIT BUS 1-TO-2: SVG FLOW LINES ════ */}
          {tier2.length > 0 && (
            <div className="flowchart-conduit-junction">
              <svg className="conduit-svg" viewBox="0 0 1000 70" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="busGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F0FF" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
                {/* Central Backbone Trunk */}
                <path d="M 500,0 L 500,32" stroke="url(#busGrad1)" strokeWidth="3" className="conduit-wire trunk" />
                {/* Branch Left to Node 2 */}
                <path d="M 500,32 L 280,32 L 280,70" stroke="url(#busGrad1)" strokeWidth="2.5" className="conduit-wire branch-left" />
                {/* Branch Right to Node 3 */}
                <path d="M 500,32 L 720,32 L 720,70" stroke="url(#busGrad1)" strokeWidth="2.5" className="conduit-wire branch-right" />
                {/* Flowchart Direction Arrows */}
                <polygon points="275,65 280,70 285,65" fill="#00F0FF" />
                <polygon points="715,65 720,70 725,65" fill="#00F0FF" />
              </svg>
              {/* Hardware Logic Junction Tag */}
              <div className="junction-chip">
                <span className="junction-pulse" />
                <span className="junction-text">QUANTUM BUS SPLITTER [1 ➔ 2 RELAYS]</span>
                <span className="junction-stat">128.4 TB/S SYNC</span>
              </div>
            </div>
          )}

          {/* ════ STAGE 02: PROCESSING MATRIX (CORE RUNTIMES) ════ */}
          {tier2.length > 0 && (
            <div className="flowchart-stage stage-tier-2">
              <div className="stage-header-ribbon">
                <span className="stage-index">STAGE 02</span>
                <span className="stage-name">CORE RUNTIME & LOGIC RELAYS</span>
                <span className="stage-flow-indicator">DUAL PIPELINE // LOAD-BALANCED</span>
              </div>
              <div className="tier-nodes-row tier-double">
                {tier2.map((r, i) => renderNodeCard(r, i + 1, "CORE RELAY", "TIER-2 PROCESSING"))}
              </div>
            </div>
          )}

          {/* ════ CONDUIT BUS 2-TO-3: SVG FLOW LINES ════ */}
          {tier3.length > 0 && (
            <div className="flowchart-conduit-junction">
              <svg className="conduit-svg" viewBox="0 0 1000 70" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="busGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="50%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#00F0FF" />
                  </linearGradient>
                </defs>
                {/* Feeds from 280 and 720 down to central manifold */}
                <path d="M 280,0 L 280,24 L 500,24" stroke="url(#busGrad2)" strokeWidth="2" className="conduit-wire in-left" />
                <path d="M 720,0 L 720,24 L 500,24" stroke="url(#busGrad2)" strokeWidth="2" className="conduit-wire in-right" />
                {/* 3-Way Multiplexer Bus to 3 Edge Nodes (180, 500, 820) */}
                <path d="M 180,24 L 820,24" stroke="url(#busGrad2)" strokeWidth="2.5" className="conduit-wire bus-bar" />
                <path d="M 180,24 L 180,70" stroke="url(#busGrad2)" strokeWidth="2" className="conduit-wire drop-1" />
                <path d="M 500,24 L 500,70" stroke="url(#busGrad2)" strokeWidth="2.5" className="conduit-wire drop-2" />
                <path d="M 820,24 L 820,70" stroke="url(#busGrad2)" strokeWidth="2" className="conduit-wire drop-3" />
                {/* Terminal Arrows */}
                <polygon points="176,65 180,70 184,65" fill="#C084FC" />
                <polygon points="496,65 500,70 504,65" fill="#00F0FF" />
                <polygon points="816,65 820,70 824,65" fill="#C084FC" />
              </svg>
              {/* Hardware Logic Junction Tag */}
              <div className="junction-chip edge-chip">
                <span className="junction-pulse" />
                <span className="junction-text">EDGE MULTIPLEXER ROUTER [2 ➔ 3 SATELLITES]</span>
                <span className="junction-stat">ACTIVE DATA STREAMS</span>
              </div>
            </div>
          )}

          {/* ════ STAGE 03: DISTRIBUTED OUTPOSTS (EDGE MODULES) ════ */}
          {tier3.length > 0 && (
            <div className="flowchart-stage stage-tier-3">
              <div className="stage-header-ribbon">
                <span className="stage-index">STAGE 03</span>
                <span className="stage-name">DISTRIBUTED EDGE MODULES & OUTPOSTS</span>
                <span className="stage-flow-indicator">TERMINAL NODES // SUBSPACE EMISSION</span>
              </div>
              <div className="tier-nodes-row tier-triple">
                {tier3.map((r, i) => renderNodeCard(r, i + 3, "EDGE OUTPOST", "TIER-3 SATELLITE"))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: TACTICAL MATRIX GRID */
        <div className="tactical-matrix-grid">
          {scored.map((r, i) => {
            const tierLabel = i === 0 ? "COMMAND HUB" : i <= 2 ? "CORE RELAY" : "EDGE OUTPOST";
            const levelLabel = i === 0 ? "TIER-1 FLAGSHIP" : i <= 2 ? "TIER-2 PROCESSING" : "TIER-3 SATELLITE";
            return renderNodeCard(r, i, tierLabel, levelLabel);
          })}
        </div>
      )}

      {/* Schematic Flowchart / Tactical Matrix Baseline Footer Telemetry */}
      <div className="flowchart-footer-telemetry">
        <div className="telemetry-line left">
          <span className="terminal-prompt">&gt;</span>
          <span>
            {isMobile
              ? "STARBASE TACTICAL MATRIX STATUS: ALL SECTORS SYNCHRONIZED"
              : "STARBASE FLOWCHART PIPELINE STATUS: ALL CIRCUITS SYNCHRONIZED"}
          </span>
        </div>
        <div className="telemetry-line right">
          <span>COSMIC TELEMETRY PROTOCOL // ENCRYPTION: SHA-256</span>
          <span className="blinking-cursor">_</span>
        </div>
      </div>
    </div>
  );
}
