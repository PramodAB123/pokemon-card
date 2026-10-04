import { STAR_SYSTEMS, VULNERABILITY_MAP, CLEARANCE_CONFIG, FLEET_RANKS } from "./constants.js";
import { clamp, accountAge, generateShipId, getStreakLevel } from "./utils.js";

// ── Level Calculation ───────────────────────────────────────
export function levelThreshold(n) {
  return n * n + 4;
}

export function computeLevel(commits) {
  if (!commits || commits < 5) return 1;
  let n = 1;
  while (n < 99 && levelThreshold(n + 1) <= commits) {
    n++;
  }
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
export function computeMissionPoints({ commits, prs, stars, followers, forks, accountAgeYears }) {
  const commitMP = (commits || 0) * 10;
  const prMP = (prs || 0) * 50;
  const starMP = (stars || 0) * 100;
  const socialMP = (followers || 0) * 5 + (forks || 0) * 10 + Math.round((accountAgeYears || 0) * 20);
  return Math.max(100, commitMP + prMP + starMP + socialMP);
}

// ── Shield Energy ───────────────────────────────────────────
export function computeShieldEnergy({ level, publicRepos, accountAgeYears, totalStars }) {
  const base = 50 + (level || 1) * 10;
  const repo = Math.min(80, (publicRepos || 0) * 4);
  const age = Math.min(60, Math.round((accountAgeYears || 0) * 8));
  const stars = Math.min(60, Math.round(Math.log10((totalStars || 0) + 1) * 20));
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

  // Level threshold calculation for MP progress bar
  const curLevelL = levelThreshold(level);
  const nextLevelL = levelThreshold(level + 1);
  const curLvlBaseMP = curLevelL * 150;
  const nextLvlTargetMP = Math.max(curLvlBaseMP + 1000, nextLevelL * 150);
  const effectiveMP = Math.max(mp, curLvlBaseMP);
  const mpProgress = Math.min(
    100,
    Math.max(5, Math.round(((effectiveMP - curLvlBaseMP) / (nextLvlTargetMP - curLvlBaseMP)) * 100))
  );

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
