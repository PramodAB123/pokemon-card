import React from "react";
import { TYPE_COLORS, RARITY_CONFIG, POKEMON_IDS } from "../lib/constants.js";
import { fmt } from "../lib/utils.js";

export default function TrainerCard({ d }) {
  const rc = RARITY_CONFIG[d.rarity];
  const tc = TYPE_COLORS[d.type] || TYPE_COLORS.normal;
  const pokeId = POKEMON_IDS[d.userId % POKEMON_IDS.length];

  const accountDays = Math.round((d.accountAgeYears || 0) * 365);
  const numLangs    = Object.keys(d.langCounts || {}).length;
  const moves = [
    { icon: "⚡", name: "Commit Surge",  cost: fmt(d.totalCommits), unit: "commits" },
    { icon: "📦", name: "Repo Count",    cost: fmt(d.publicRepos),  unit: "repos"   },
    { icon: "🗣️", name: "Languages",    cost: fmt(numLangs),        unit: "langs"   },
    { icon: "📅", name: "Days Active",   cost: fmt(accountDays),    unit: "days"    },
  ];

  const weakType = {
    fire:"water", water:"electric", grass:"fire", electric:"ground",
    psychic:"ghost", ghost:"dark", dragon:"ice", dark:"fairy", steel:"fire",
    fighting:"psychic", flying:"rock", poison:"ground", ground:"water",
    rock:"grass", ice:"fighting", fairy:"steel", normal:"fighting"
  }[d.type] || "dark";

  return (
    <div
      className="github-card"
      id="generatedCard"
      style={{ "--type-bg": tc.bg, "--type-light": tc.light, "--type-dark": tc.dark }}
    >
      <div className="ptc-frame">

        {/* ① Header */}
        <div className="ptc-header" style={{ background: `linear-gradient(135deg,${tc.dark} 0%,${tc.bg}55 100%)` }}>
          <div className="ptc-header-left">
            <span className="ptc-name">{d.displayName || d.username}</span>
            <div className="ptc-sub-row">
              <span
                className="ptc-stage-badge"
                style={{ background: `${tc.bg}33`, color: tc.light, border: `1px solid ${tc.bg}66` }}
              >
                {d.stage}
              </span>
              <span className="ptc-type-pill" style={{ background: tc.bg, color: "#fff" }}>
                {d.type.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ptc-header-right">
            <span className="ptc-hp-label">HP</span>
            <span className="ptc-hp-val" style={{ color: tc.light, textShadow: `0 0 12px ${tc.bg}` }}>
              {d.hp}
            </span>
          </div>
        </div>

        {/* ② Artwork Panel */}
        <div className="ptc-art-panel" style={{ borderColor: `${tc.light}55` }}>
          <img className="ptc-avatar-bg" src={d.avatarUrl} alt="" aria-hidden="true" loading="lazy" />
          <div
            className="ptc-art-wash"
            style={{ background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${tc.bg}66 0%, ${tc.dark}99 60%, #060810 100%)` }}
          />
          <div className="ptc-avatar-wrap">
            <img className="ptc-avatar" src={d.avatarUrl} alt={d.username} loading="lazy" />
            <div
              className="ptc-avatar-ring"
              style={{ borderColor: tc.light, boxShadow: `0 0 18px ${tc.bg}, inset 0 0 12px ${tc.bg}44` }}
            />
          </div>
          <div className="ptc-art-vignette" />
          <div className="ptc-rarity-badge" style={{ color: rc.color, textShadow: `0 0 8px ${rc.color}` }}>
            {rc.label.repeat(rc.stars)}
          </div>
        </div>

        {/* ③ Type Band */}
        <div
          className="ptc-type-band"
          style={{
            background: `linear-gradient(90deg,${tc.dark},${tc.bg}88,${tc.dark})`,
            borderTop: `1px solid ${tc.bg}66`,
            borderBottom: `1px solid ${tc.bg}66`,
          }}
        >
          <span className="ptc-band-text" style={{ color: tc.light }}>
            ✦ {(d.topLang || d.type).toUpperCase()} TYPE · LV.{d.level} · {d.rarity.toUpperCase()} ✦
          </span>
        </div>

        {/* ④ Moves */}
        <div className="ptc-moves" style={{ background: `${tc.dark}44` }}>
          {moves.map((m, i) => (
            <div className="ptc-move" key={i}>
              <span className="ptc-move-icon">{m.icon}</span>
              <span className="ptc-move-name">{m.name}</span>
              <span className="ptc-move-cost">{m.cost}</span>
              <span className="ptc-move-unit">{m.unit}</span>
            </div>
          ))}
        </div>

        {/* ⑤ EXP Bar */}
        <div className="ptc-exp-section">
          <div className="ptc-exp-labels">
            <span style={{ color: `${tc.light}88` }}>EXP POINTS</span>
            <span style={{ color: `${tc.light}88` }}>{d.xpToNext} to Lv.{d.level + 1}</span>
          </div>
          <div className="ptc-exp-track">
            <div
              className="ptc-exp-fill"
              style={{
                width: `${d.xpProgress}%`,
                background: `linear-gradient(90deg,${tc.dark},${tc.bg},${tc.light})`,
                boxShadow: `0 0 10px ${tc.bg}88`,
              }}
            />
          </div>
        </div>

        {/* ⑥ Footer */}
        <div className="ptc-footer">
          <span className="ptc-foot-item">WEAK: {weakType.toUpperCase()}</span>
          <span className="ptc-foot-mid">#{String(d.userId).padStart(6, "0")}</span>
          <span className="ptc-foot-item">SINCE {d.joinedYear}</span>
        </div>

      </div>
    </div>
  );
}
