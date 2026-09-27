import React from "react";
import { LANG_COLORS } from "../lib/constants.js";
import { getTypeIcon, fmt } from "../lib/utils.js";

export default function RightPanel({ d }) {
  const streak = d.streak;

  const profileRows = [
    { label: "Type",    val: getTypeIcon(d.type) + " " + d.type },
    { label: "Rarity",  val: d.rarity.replace("-", " ") },
    { label: "Stage",   val: d.stage + " Trainer" },
    { label: "HP",      val: String(d.hp) },
    { label: "Level",   val: String(d.level) },
    { label: "Following", val: fmt(d.following || 0) },
  ];

  return (
    <div className="rp-card">

      {/* Languages */}
      <div className="rp-section">
        <div className="rp-header">
          <div className="rp-accent-line" />
          <span className="rp-title">Languages</span>
        </div>
        <div className="rp-lang-list">
          {d.langPercents.length > 0 ? d.langPercents.map((lp, i) => {
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
          }) : <span className="rp-empty">No language data</span>}
        </div>
      </div>

      {/* Trainer Profile */}
      <div className="rp-section">
        <div className="rp-header">
          <div className="rp-accent-line" />
          <span className="rp-title">Trainer Profile</span>
        </div>
        <div className="rp-profile">
          {profileRows.map((r, i) => (
            <div className="rp-profile-row" key={i}>
              <span className="rp-profile-label">{r.label}</span>
              <span className="rp-profile-val">{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div className="rp-streak" style={{ borderColor: `${streak.color}44` }}>
        <span className="rp-streak-label">Commit Streak</span>
        <span className="rp-streak-val" style={{ color: streak.color }}>{streak.label}</span>
      </div>

    </div>
  );
}
