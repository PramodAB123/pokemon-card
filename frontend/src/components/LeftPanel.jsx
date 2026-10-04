import React from "react";
import { fmt } from "../lib/utils.js";

const logPct = (val, max) => Math.min(100, Math.round((Math.log10(val + 1) / Math.log10(max + 1)) * 100));
const linPct = (val, max) => Math.min(100, Math.round((val / max) * 100));

export default function LeftPanel({ d }) {
  const topLangName = d.langPercents[0]?.lang || "Uncharted";
  const numLangs    = Object.keys(d.langCounts || {}).length;
  const activeDays  = Math.min(365, d.recentCommits > 0 ? Math.round(d.recentCommits * 8.5) : 0);

  const metrics = [
    { label: "Warp Commits",   sub: "all-time pushes",       val: d.totalCommits,   unit: "commits",   pct: logPct(d.totalCommits, 5000) },
    { label: "Starbases",      sub: "public repositories",   val: d.publicRepos,    unit: "repos",     pct: logPct(d.publicRepos, 200) },
    { label: "Star Systems",   sub: "primary: " + topLangName, val: numLangs,        unit: "systems",   pct: linPct(numLangs, 10) },
    { label: "Starlight Stars",sub: "stellar beacons",       val: d.totalStars,     unit: "stars",     pct: logPct(d.totalStars, 5000) },
    { label: "Fleet Followers",sub: "expedition network",    val: d.followers,      unit: "crew",      pct: logPct(d.followers, 10000) },
    { label: "Deploy Sorties", sub: "merged pull requests",  val: d.totalPRs,       unit: "PRs",       pct: logPct(d.totalPRs, 200) },
    { label: "Fleet Service",  sub: "since " + d.joinedYear, val: d.accountAgeYears, unit: d.accountAgeYears === 1 ? "yr" : "yrs", pct: linPct(d.accountAgeYears, 12) },
    { label: "Orbital Patrol", sub: "subspace telemetry",    val: activeDays,       unit: "days",      pct: linPct(activeDays, 365) },
  ];

  return (
    <div className="sm-card">
      <div className="sm-header">
        <div className="sm-accent-line" />
        <span className="sm-title">Fleet Telemetry</span>
      </div>

      <div className="sm-trainer-info">
        <img className="sm-avatar" src={d.avatarUrl} alt={d.username} loading="lazy" />
        <div className="sm-trainer-text">
          <span className="sm-trainer-name">{d.displayName || d.username}</span>
          <span className="sm-trainer-handle">@{d.username} · {d.shipId}</span>
          {d.bio && <span className="sm-trainer-bio">{d.bio}</span>}
        </div>
      </div>

      <div className="sm-rows">
        {metrics.map((m, i) => (
          <div className="sm-row" key={i}>
            <div className="sm-row-top">
              <div className="sm-label-col">
                <span className="sm-label">{m.label}</span>
                <span className="sm-sub">{m.sub}</span>
              </div>
              <div className="sm-val-col">
                <span className="sm-num">{fmt(m.val)}</span>
                <span className="sm-unit">{m.unit}</span>
              </div>
            </div>
            <div className="sm-bar-bg">
              <div
                className="sm-bar-fill"
                style={{
                  width: `${Math.round(m.pct)}%`,
                  background: `linear-gradient(90deg, #38BDF8, #818CF8)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
