import { STAR_SYSTEMS, VULNERABILITY_MAP, CLEARANCE_CONFIG, FLEET_RANKS } from "./constants.js";
import { clamp, accountAge, generateShipId, getStreakLevel } from "./utils.js";

// ── Level Calculation ───────────────────────────────────────
// Logarithmic curve: level 1 at 0 commits, level 99 only at LEVEL_CAP_COMMITS.
// Roughly: 100 → 14, 1k → 30, 10k → 47, 100k → 64, 1M → 82.
export const MAX_LEVEL = 99;
const LEVEL_SOFTNESS = 20;
const LEVEL_CAP_COMMITS = 10_000_000;
const LEVEL_SPAN = Math.log10(1 + LEVEL_CAP_COMMITS / LEVEL_SOFTNESS);

export function levelThreshold(n) {
  if (n <= 1) return 0;
  const lvl = Math.min(n, MAX_LEVEL);
  return Math.ceil(LEVEL_SOFTNESS * (10 ** (((lvl - 1) / (MAX_LEVEL - 1)) * LEVEL_SPAN) - 1));
}

export function computeLevel(commits) {
  if (!commits || commits < 1) return 1;
  let n = Math.floor(1 + ((MAX_LEVEL - 1) * Math.log10(1 + commits / LEVEL_SOFTNESS)) / LEVEL_SPAN);
  n = Math.max(1, Math.min(MAX_LEVEL, n));
  // Snap to the integer thresholds so level and progress bar always agree
  while (n > 1 && levelThreshold(n) > commits) n--;
  while (n < MAX_LEVEL && levelThreshold(n + 1) <= commits) n++;
  return n;
}

export function computeRepoLevel(commits) {
  const thresholds = [3, 5, 10, 17, 26, 37, 50, 65, 82, 100, 120, 142, 166, 192, 220, 250, 282, 316, 352, 390, 430, 475];
  for (let i = 0; i < thresholds.length; i++) {
    if (commits < thresholds[i]) return i + 1;
  }
  return Math.min(99, thresholds.length + 1);
}

// ── Mission Points (MP) ──────────────────────────────────────
const COMMIT_MP = 10;

export function computeMissionPoints({ commits, prs, stars, followers, forks, accountAgeYears }) {
  const commitMP = (commits || 0) * COMMIT_MP;
  const prMP = (prs || 0) * 50;
  const starMP = (stars || 0) * 100;
  const socialMP = (followers || 0) * 5 + (forks || 0) * 10 + Math.round((accountAgeYears || 0) * 20);
  return Math.max(100, commitMP + prMP + starMP + socialMP);
}

// ── Shield Energy ───────────────────────────────────────────
// Each component has its own ceiling and they sum to < 999, so the clamp is
// only a safety net: 100 + 495 (level) + 120 (repos) + 100 (age) + 180 (stars).
export function computeShieldEnergy({ level, publicRepos, accountAgeYears, totalStars }) {
  const base = 100 + (level || 1) * 5;
  const repo = Math.min(120, Math.round(Math.log10((publicRepos || 0) + 1) * 45));
  const age = Math.min(100, Math.round((accountAgeYears || 0) * 7));
  const stars = Math.min(180, Math.round(Math.log10((totalStars || 0) + 1) * 36));
  return clamp(base + repo + age + stars, 50, 999);
}

// ── Fleet Rank ──────────────────────────────────────────────
export function getFleetRank(level) {
  for (const rank of FLEET_RANKS) {
    if (level >= rank.minLvl) return rank;
  }
  return FLEET_RANKS[FLEET_RANKS.length - 1];
}

// ── Clearance Level ─────────────────────────────────────────
export function getClearanceLevel({ totalStars, publicRepos, totalCommits, totalPRs }) {
  const score =
    Math.log10((totalStars || 0) + 1) * 25 +
    Math.min(publicRepos || 0, 40) * 1.5 +
    Math.log10((totalCommits || 0) + 1) * 20 +
    (totalPRs || 0) * 2;

  if (score < 20) return CLEARANCE_CONFIG.standard;
  if (score < 50) return CLEARANCE_CONFIG.classified;
  if (score < 90) return CLEARANCE_CONFIG["top-secret"];
  if (score < 140) return CLEARANCE_CONFIG.ultra;
  return CLEARANCE_CONFIG["black-ops"];
}

// ── Main Card Data Compute ──────────────────────────────────
export function computeCardData({ profile, repos = [], events = [], prCount = 0, totalCommits: totalCommitsRaw = 0 }) {
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const followers = profile.followers || 0;
  const following = profile.following || 0;
  const publicRepos = profile.public_repos || 0;

  // Language aggregation
  const langCounts = {};
  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });

  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const topLang = sortedLangs[0]?.[0] || "default";

  // Event parsing for recent activity
  let recentCommits = 0;
  let recentPRs = 0;
  let recentIssues = 0;
  const repoCommitMap = {};

  events.forEach((ev) => {
    if (ev.type === "PushEvent") {
      const count = ev.payload?.commits?.length || 1;
      recentCommits += count;
      const repoName = ev.repo?.name?.split("/")[1];
      if (repoName) {
        repoCommitMap[repoName] = (repoCommitMap[repoName] || 0) + count;
      }
    }
    if (ev.type === "PullRequestEvent") recentPRs++;
    if (ev.type === "IssuesEvent") recentIssues++;
  });

  const accountAgeYears = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
  const accountAgeDays = Math.max(1, Math.round(accountAgeYears * 365));
  const totalPRs = prCount || 0;
  const totalCommits = totalCommitsRaw || recentCommits || 1;

  // Level & MP
  const level = computeLevel(totalCommits);
  const mp = computeMissionPoints({
    commits: totalCommits,
    prs: totalPRs,
    stars: totalStars,
    followers,
    forks: totalForks,
    accountAgeYears,
  });

  // Reactor bar: progress through the current level's commit band. The MP
  // target is current MP plus the MP the remaining commits would add, so it
  // is always >= mp. At max level the bar is simply full.
  let mpProgress = 100;
  let nextLvlTargetMP = mp;
  if (level < MAX_LEVEL) {
    const curLevelC = levelThreshold(level);
    const nextLevelC = levelThreshold(level + 1);
    const frac = (totalCommits - curLevelC) / Math.max(1, nextLevelC - curLevelC);
    mpProgress = clamp(Math.round(frac * 100), 5, 100);
    nextLvlTargetMP = mp + Math.max(0, nextLevelC - totalCommits) * COMMIT_MP;
  }

  // Star System & Vulnerability
  const starSystem = STAR_SYSTEMS[topLang] || STAR_SYSTEMS.default;
  const vulnInfo = VULNERABILITY_MAP[starSystem.name] || { weakTo: "Void", reason: "Unknown cosmic interference" };

  // Shield Energy
  const shield = computeShieldEnergy({
    level,
    publicRepos,
    accountAgeYears,
    totalStars,
  });

  // Clearance Tier
  const clearance = getClearanceLevel({
    totalStars,
    publicRepos,
    totalCommits,
    totalPRs,
  });

  // Fleet Rank
  const fleetRank = getFleetRank(level);

  // Ship ID
  const shipId = generateShipId(profile.login, profile.id);

  // Streak & Stage
  const stage = accountAge(profile.created_at);
  const streak = getStreakLevel(recentCommits);

  // Top repositories sorted by composite score
  const topRepos = [...repos]
    .map((r) => ({
      ...r,
      _commitCount: repoCommitMap[r.name] || 0,
      _score:
        (r.stargazers_count || 0) * 10 +
        (r.forks_count || 0) * 5 +
        (repoCommitMap[r.name] || 0) * 3 +
        (r.description ? 2 : 0) +
        (r.language ? 1 : 0),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  // Language percentages
  const totalLangRepos = Object.values(langCounts).reduce((s, v) => s + v, 0) || 1;
  const langPercents = sortedLangs.slice(0, 6).map(([lang, count]) => ({
    lang,
    count,
    pct: Math.round((count / totalLangRepos) * 100),
  }));

  const joinedYear = new Date(profile.created_at).getFullYear();

  // Abilities (Card Moves)
  const abilities = [
    { icon: "⚡", name: "Warp Commit", cost: totalCommits.toLocaleString(), unit: "commits" },
    { icon: "🛸", name: "Orbital Deploy", cost: publicRepos.toLocaleString(), unit: "repos" },
    { icon: "📡", name: "Signal Broadcast", cost: Object.keys(langCounts).length.toLocaleString(), unit: "languages" },
    { icon: "🔭", name: "Deep Scan", cost: accountAgeDays.toLocaleString(), unit: "days" },
  ];

  return {
    username: profile.login,
    displayName: profile.name || profile.login,
    avatar: profile.avatar_url,
    avatarUrl: profile.avatar_url,
    bio: profile.bio || "Subspace open-source explorer.",
    location: profile.location || null,
    company: profile.company || null,
    blog: profile.blog || null,
    joinedYear,
    userId: profile.id,

    // GitStar Explorer Stats
    starSystem,
    vulnInfo,
    shield,
    level,
    fleetRank,
    clearance,
    shipId,
    mp,
    nextLvlTargetMP,
    mpProgress,
    abilities,
    accountAgeDays,
    accountAgeYears: Math.floor(accountAgeYears),
    stage,
    streak,

    // GitHub stats
    totalStars,
    totalForks,
    followers,
    following,
    publicRepos,
    totalCommits,
    recentCommits,
    totalPRs,
    recentPRs,
    recentIssues,
    topRepos,
    langCounts,
    langPercents,
    topLang,

    // Compatibility fields
    hp: shield,
    type: starSystem.name.toLowerCase(),
    rarity: clearance.id,
  };
}
