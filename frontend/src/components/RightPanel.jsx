import React from "react";
import { LANG_COLORS } from "../lib/constants.js";
import { fmt } from "../lib/utils.js";

export default function RightPanel({ d }) {
  const streak = d.streak;
  const sys = d.starSystem;

  const dossierRows = [
    { label: "Star System", val: `${sys.icon} ${sys.name}` },
    { label: "Clearance",   val: d.clearance.label },
    { label: "Fleet Rank",  val: `${d.fleetRank.badge} ${d.fleetRank.title}` },
    { label: "Shield Energy", val: String(d.shield) },
    { label: "Explorer Level", val: `LVL ${d.level}` },
    { label: "Comm Network", val: `${fmt(d.following || 0)} crew` },
  ];

  return (
    <div className="rp-card">

      {/* Star Systems / Languages */}
      <div className="rp-section">
        <div className="rp-header">
          <div className="rp-accent-line" style={{ background: "linear-gradient(#38BDF8, #818CF8)" }} />
          <span className="rp-title">Star Systems</span>
        </div>
        <div className="rp-lang-list">
          {d.langPercents.length > 0 ? (
            d.langPercents.map((lp, i) => {
              const lc = LANG_COLORS[lp.lang] || LANG_COLORS.default;
              return (
                <div className="rp-lang-row" key={i}>
                  <span className="rp-lang-dot" style={{ background: lc }} />
                  <span className="rp-lang-name">{lp.lang}</span>
                  <div className="rp-lang-bar-bg">
                    <div className="rp-lang-bar-fill" style={{ width: `${lp.pct}%`, background: lc }} />
                  </div>
                  <span className="rp-lang-pct">{lp.pct}%</span>
                </div>
              );
            })
          ) : (
            <span className="rp-empty">No telemetry data recorded</span>
          )}
        </div>
      </div>

      {/* Explorer Dossier */}
      <div className="rp-section">
        <div className="rp-header">
          <div className="rp-accent-line" style={{ background: "linear-gradient(#F59E0B, #EC4899)" }} />
          <span className="rp-title">Explorer Dossier</span>
        </div>
        <div className="rp-profile">
          {dossierRows.map((r, i) => (
            <div className="rp-profile-row" key={i}>
              <span className="rp-profile-label">{r.label}</span>
              <span className="rp-profile-val">{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subspace Pulse Streak */}
      <div className="rp-streak" style={{ borderColor: `${streak.color}44` }}>
        <span className="rp-streak-label">Subspace Core</span>
        <span className="rp-streak-val" style={{ color: streak.color }}>{streak.label}</span>
      </div>

    </div>
  );
}
