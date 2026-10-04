import React from "react";
import { LANG_COLORS, STAR_SYSTEMS } from "../lib/constants.js";
import { fmt, timeAgo } from "../lib/utils.js";
import { computeRepoLevel } from "../lib/computeCardData.js";

export default function ReposGrid({ d }) {
  if (!d.topRepos || d.topRepos.length === 0) {
    return (
      <div className="repos-empty">
        <span className="repos-empty-icon">🛸</span>
        <span>No orbital starbases deployed yet — every interstellar fleet starts with a single launch!</span>
      </div>
    );
  }

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

  return (
    <div className="repos-grid">
      {scored.map((r) => {
        const langColor = LANG_COLORS[r.language] || LANG_COLORS.default;
        const system = STAR_SYSTEMS[r.language] || STAR_SYSTEMS.default;
        const sizeSignal = Math.log2((r.size || 0) + 2);
        const commitSignal = r._commitCount || 0;
        const repoLevel = computeRepoLevel(commitSignal + Math.round(sizeSignal));
        const shieldPct = Math.max(18, Math.round((r._score / maxScore) * 100));
        const shieldColor = shieldPct > 65 ? "#38BDF8" : shieldPct > 35 ? "#F59E0B" : "#EC4899";
        const desc = r.description
          ? r.description.length > 70
            ? r.description.slice(0, 67) + "…"
            : r.description
          : "Subspace beacon station with open telemetry.";

        return (
          <a
            key={r.name}
            className="repo-card"
            href={`https://github.com/${d.username}/${r.name}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ "--card-accent": system.color }}
          >
            {/* Outpost Telemetry Header Visual */}
            <div
              className="repo-outpost-bay"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${system.color}33 0%, ${system.dark}88 60%, #030712 100%)`,
              }}
            >
              <div className="outpost-visual">
                <svg className="outpost-svg" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="30" r="22" stroke={system.color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <ellipse cx="50" cy="30" rx="36" ry="10" stroke={system.light} strokeWidth="1.2" opacity="0.8" />
                  <polygon points="50,14 62,26 50,38 38,26" fill={system.color} opacity="0.85" />
                  <circle cx="50" cy="26" r="4" fill="#FFFFFF" />
                  <line x1="50" y1="6" x2="50" y2="14" stroke={system.light} strokeWidth="1.5" />
                  <line x1="50" y1="38" x2="50" y2="48" stroke={system.light} strokeWidth="1.5" />
                </svg>
              </div>
              <span className="repo-level-tag">SECTOR LVL {repoLevel}</span>
            </div>

            <div className="repo-card-body">
              <div className="repo-card-header">
                <span className="repo-name">{r.name}</span>
              </div>

              {/* Shield Integrity Indicator */}
              <div className="repo-shield-row">
                <span className="shield-label">INTEGRITY</span>
                <div className="shield-bar-bg">
                  <div
                    className="shield-bar-fill"
                    style={{ width: `${shieldPct}%`, background: shieldColor }}
                  />
                </div>
                <span className="shield-num">{shieldPct}%</span>
              </div>

              <p className="repo-desc">{desc}</p>

              <div className="repo-footer">
                {r.language && (
                  <span
                    className="repo-lang-tag"
                    style={{
                      background: `${langColor}18`,
                      borderColor: `${langColor}44`,
                      color: langColor,
                    }}
                  >
                    <span className="lang-dot" style={{ background: langColor }} />
                    {system.name} ({r.language})
                  </span>
                )}
                {r.stargazers_count > 0 && <span className="repo-stars">★ {fmt(r.stargazers_count)}</span>}
                {r.forks_count > 0 && <span className="repo-forks">🔀 {fmt(r.forks_count)}</span>}
                {r._commitCount > 0 && <span className="repo-commits">⚡ {r._commitCount} recent</span>}
                {r._commitCount === 0 && r.stargazers_count === 0 && r.forks_count === 0 && r.updated_at && (
                  <span className="repo-updated">Scanned {timeAgo(r.updated_at)}</span>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
