import React from "react";
import { LANG_COLORS, LANG_TYPE, TYPE_COLORS, POKEMON_IDS } from "../lib/constants.js";
import { fmt, timeAgo } from "../lib/utils.js";
import { computeRepoLevel } from "../lib/computeCardData.js";

export default function ReposGrid({ d }) {
  if (!d.topRepos || d.topRepos.length === 0) {
    return (
      <div className="repos-empty">
        <span className="repos-empty-icon">📦</span>
        <span>No public repositories yet — every legend starts somewhere!</span>
      </div>
    );
  }

  const scored = d.topRepos.map(r => ({
    ...r,
    _score: (r.stargazers_count || 0) * 10 +
            (r.forks_count || 0) * 5 +
            (r._commitCount || 0) * 3 +
            (r.description ? 2 : 0) +
            (r.language ? 1 : 0)
  })).sort((a, b) => b._score - a._score).slice(0, 6);

  const maxScore = Math.max(...scored.map(r => r._score), 1);

  return (
    <div className="repos-grid">
      {scored.map((r, i) => {
        const langColor = LANG_COLORS[r.language] || LANG_COLORS.default;
        const type2 = LANG_TYPE[r.language] || "normal";
        const tc2   = TYPE_COLORS[type2] || TYPE_COLORS.normal;
        const sizeSignal   = Math.log2((r.size || 0) + 2);
        const commitSignal = r._commitCount || 0;
        const repoLevel = computeRepoLevel(commitSignal + Math.round(sizeSignal));
        const hpPct  = Math.max(15, Math.round((r._score / maxScore) * 100));
        const hpColor = hpPct > 65 ? "#4CAF50" : hpPct > 35 ? "#FDD835" : "#64B5F6";
        const desc = r.description
          ? (r.description.length > 65 ? r.description.slice(0, 62) + "…" : r.description)
          : "No description yet";
        const pokeId = POKEMON_IDS[(d.userId + i + 7) % POKEMON_IDS.length];

        return (
          <a
            key={r.name}
            className="repo-card"
            href={`https://github.com/${d.username}/${r.name}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ "--card-accent": tc2.bg }}
          >
            <div
              className="repo-poke-wrap"
              style={{ background: `radial-gradient(ellipse at 50% 40%, ${tc2.bg}70 0%, ${tc2.dark}ee 50%, #00040e 100%)` }}
            >
              <img
                className="repo-poke-img"
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`}
                alt="pokemon"
                loading="lazy"
              />
              <span className="repo-poke-level">Lv.{repoLevel}</span>
            </div>

            <div className="repo-card-body">
              <div className="repo-card-header">
                <span className="repo-name">{r.name}</span>
              </div>
              <div className="repo-hp-row">
                <span className="hp-text">HP</span>
                <div className="hp-bar-bg">
                  <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
                </div>
                <span className="hp-num">{hpPct}%</span>
              </div>
              <p className="repo-desc">{desc}</p>
              <div className="repo-footer">
                {r.language && (
                  <span
                    className="repo-lang-tag"
                    style={{ background: `${langColor}22`, borderColor: `${langColor}44`, color: langColor }}
                  >
                    <span className="lang-dot" style={{ background: langColor }} />
                    {r.language}
                  </span>
                )}
                {r.stargazers_count > 0 && <span className="repo-stars">⭐ {fmt(r.stargazers_count)}</span>}
                {r.forks_count > 0 && <span className="repo-forks">🔀 {fmt(r.forks_count)}</span>}
                {r._commitCount > 0 && <span className="repo-commits">⚡ {r._commitCount} recent</span>}
                {r._commitCount === 0 && r.stargazers_count === 0 && r.forks_count === 0 && r.updated_at && (
                  <span className="repo-updated">Updated {timeAgo(r.updated_at)}</span>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
