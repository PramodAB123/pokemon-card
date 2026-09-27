import React from "react";
import { fmt } from "../lib/utils.js";

const logPct = (val, max) => Math.min(100, Math.round((Math.log10(val + 1) / Math.log10(max + 1)) * 100));
const linPct = (val, max) => Math.min(100, Math.round((val / max) * 100));

export default function LeftPanel({ d }) {
  const topLangName = d.langPercents[0]?.lang || "—";
  const numLangs    = Object.keys(d.langCounts || {}).length;
  const activeDays  = Math.min(365, d.recentCommits > 0 ? Math.round(d.recentCommits * 8.5) : 0);

  const metrics = [
    { label: "Total Commits",  sub: "all-time pushes",        val: d.totalCommits,   unit: "commits",   pct: logPct(d.totalCommits, 5000) },
    { label: "Repositories",   sub: "public projects",        val: d.publicRepos,    unit: "repos",     pct: logPct(d.publicRepos, 200) },
    { label: "Languages",      sub: "top: " + topLangName,   val: numLangs,          unit: "langs",     pct: linPct(numLangs, 10) },
    { label: "Stars Earned",   sub: "across all repos",       val: d.totalStars,     unit: "stars",     pct: logPct(d.totalStars, 5000) },
    { label: "Followers",      sub: "community reach",        val: d.followers,      unit: "followers", pct: logPct(d.followers, 10000) },
    { label: "Pull Requests",  sub: "merged & open PRs",      val: d.totalPRs,       unit: "PRs",       pct: logPct(d.totalPRs, 200) },
    { label: "Account Age",    sub: "since " + d.joinedYear, val: d.accountAgeYears, unit: d.accountAgeYears === 1 ? "yr" : "yrs", pct: linPct(d.accountAgeYears, 12) },
    { label: "Active Days",    sub: "est. from activity",     val: activeDays,       unit: "days",      pct: linPct(activeDays, 365) },
  ];

  return (
    <div className="sm-card">
      <div className="sm-header">
        <div className="sm-accent-line" />
        <span className="sm-title">Scouting Metrics</span>
      </div>

      <div className="sm-trainer-info">
        <img className="sm-avatar" src={d.avatarUrl} alt={d.username} loading="lazy" />
        <div className="sm-trainer-text">
          <span className="sm-trainer-name">{d.displayName || d.username}</span>
          <span className="sm-trainer-handle">@{d.username}</span>
          {d.bio && <span className="sm-trainer-bio">{d.bio}</span>}
        </div>
      </div>

      <div className="sm-rows">
        {metrics.map((m, i) => (
          <div className="sm-row" key={i}>
            <div className="sm-row-top">
              <span className="sm-label">{m.label}</span>
              <span className="sm-right">
                <span className="sm-sub">{m.sub}</span>
                <span className="sm-num">{fmt(m.val)}</span>
                <span className="sm-unit">{m.unit}</span>
              </span>
            </div>
            <div className="sm-bar-bg">
              <div className="sm-bar-fill" style={{ width: `${Math.round(m.pct)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
