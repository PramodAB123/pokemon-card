import { LANG_TYPE, TYPE_COLORS } from "./constants.js";
import { clamp, accountAge, getStreakLevel } from "./utils.js";

// ── XP & Level ────────────────────────────────────────────

export function computeXP({ totalStars, followers, recentCommits, totalForks, publicRepos, totalPRs, recentIssues, accountAgeYears }) {
  return Math.round(
    recentCommits   * 3  +
    totalPRs        * 2  +
    recentIssues    * 1  +
    publicRepos     * 2  +
    Math.log10(totalStars   + 1) * 15 +
    Math.log10(followers    + 1) * 10 +
    Math.log10(totalForks   + 1) * 8  +
    accountAgeYears * 5
  );
}

export function levelThreshold(n) { return n * n + 4; }

export function computeLevel(commits) {
  if (commits < 5) return 1;
  let n = 1;
  while (n < 99 && levelThreshold(n + 1) <= commits) n++;
  return n;
}

export function computeRepoLevel(commits) {
  const thresholds = [3,5,10,17,26,37,50,65,82,100,120,142,166,192,220,250,282,316,352,390,430,475];
  for (let i = 0; i < thresholds.length; i++) {
    if (commits < thresholds[i]) return i + 1;
  }
  return Math.min(99, thresholds.length + 1);
}

// ── HP ────────────────────────────────────────────────────

export function computeHP({ level, publicRepos, accountAgeYears, totalStars }) {
  const base  = 50 + level * 10;
  const repo  = Math.min(80, publicRepos * 4);
  const age   = Math.min(60, Math.round(accountAgeYears * 8));
  const stars = Math.min(60, Math.round(Math.log10(totalStars + 1) * 20));
  return clamp(base + repo + age + stars, 50, 999);
}

// ── Rarity ───────────────────────────────────────────────

export function getRarity({ totalStars, publicRepos, totalCommits }) {
  const score =
    Math.log10(totalStars + 1) * 30 +
    Math.min(publicRepos, 30) * 2 +
    Math.log10(totalCommits + 1) * 20;
  if (score < 10)  return "common";
  if (score < 25)  return "uncommon";
  if (score < 55)  return "holo-rare";
  if (score < 90)  return "ultra-rare";
  return "secret-rare";
}

// ── Main Compute ─────────────────────────────────────────

export function computeCardData({ profile, repos, events, prCount, totalCommits: totalCommitsRaw }) {
  const totalStars    = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks    = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const followers     = profile.followers || 0;

  const langCounts = {};
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1; });
  const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  let recentCommits = 0;
  let recentPRs = 0;
  let recentIssues = 0;
  const repoCommitMap = {};
  events.forEach(ev => {
    if (ev.type === "PushEvent") {
      const count = ev.payload?.commits?.length || 1;
      recentCommits += count;
      const repoName = ev.repo?.name?.split("/")[1];
      if (repoName) repoCommitMap[repoName] = (repoCommitMap[repoName] || 0) + count;
    }
    if (ev.type === "PullRequestEvent") recentPRs++;
    if (ev.type === "IssuesEvent")      recentIssues++;
  });

  const publicRepos = profile.public_repos || 0;
  const totalPRs    = prCount || 0;
  const accountAgeYears = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);

  const xpInputs = { totalStars, followers, recentCommits, totalForks, publicRepos, totalPRs, recentIssues, accountAgeYears };
  const xp = computeXP(xpInputs);
  const totalCommits = totalCommitsRaw || recentCommits;
  const level = computeLevel(totalCommits);
  const curThreshold  = levelThreshold(level);
  const nextThreshold = levelThreshold(level + 1);
  const commitsThisLevel = totalCommits - curThreshold;
  const commitsNeeded    = nextThreshold - curThreshold;
  const xpProgress = Math.min(100, Math.max(0, Math.round((commitsThisLevel / commitsNeeded) * 100)));
  const xpToNext = Math.max(0, nextThreshold - totalCommits);

  const hp = computeHP({ level, publicRepos: profile.public_repos || 0, accountAgeYears, totalStars });
  const type = LANG_TYPE[topLang] || "normal";
  const rarity = getRarity({ totalStars, publicRepos: profile.public_repos || 0, totalCommits });
  const stage = accountAge(profile.created_at);
  const streak = getStreakLevel(recentCommits);

  const topRepos = [...repos]
    .map(r => ({
      ...r,
      _commitCount: repoCommitMap[r.name] || 0,
      _score: (r.stargazers_count || 0) * 10 +
              (r.forks_count || 0) * 5 +
              (repoCommitMap[r.name] || 0) * 3 +
              (r.description ? 2 : 0) +
              (r.language ? 1 : 0)
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  const totalLangRepos = Object.values(langCounts).reduce((s, v) => s + v, 0);
  const langPercents = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, count]) => ({
      lang,
      count,
      pct: Math.round((count / totalLangRepos) * 100)
    }));

  const tc = TYPE_COLORS[type] || TYPE_COLORS.normal;
  const cardGradient = `linear-gradient(160deg, ${tc.light} 0%, ${tc.bg} 35%, ${tc.dark} 70%, #0a0a14 100%)`;
  const joinedYear = new Date(profile.created_at).getFullYear();

  return {
    username: profile.login,
    displayName: profile.name || profile.login,
    avatar: profile.avatar_url,
    avatarUrl: profile.avatar_url,
    bio: profile.bio || "Open source contributor",
    location: profile.location || null,
    company: profile.company || null,
    blog: profile.blog || null,
    hp, type, topLang, rarity, stage, streak,
    totalStars, totalForks, followers,
    following: profile.following || 0,
    publicRepos: profile.public_repos || 0,
    recentCommits, totalCommits,
    recentPRs: Math.max(recentPRs, prCount > 0 ? Math.floor(Math.log10(prCount + 1) * 10) : 0),
    totalPRs: prCount,
    recentIssues,
    topRepos, langCounts, langPercents,
    cardGradient,
    glowColor: tc.bg,
    joinedYear,
    userId: profile.id,
    xp, level, xpToNext, xpProgress,
    accountAgeYears: Math.floor(accountAgeYears),
    repoCommitMap,
  };
}
