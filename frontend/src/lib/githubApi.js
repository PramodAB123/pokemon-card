// ── GitHub API ────────────────────────────────────────────

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status });
  return res.json();
}

export async function fetchGithubData(username) {
  const [profile, repos, events] = await Promise.all([
    fetchJSON(`https://api.github.com/users/${username}`),
    fetchJSON(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
    fetchJSON(`https://api.github.com/users/${username}/events/public?per_page=50`),
  ]);

  let prCount = 0;
  try {
    const prSearch = await fetchJSON(
      `https://api.github.com/search/issues?q=author:${encodeURIComponent(username)}+type:pr&per_page=1`
    );
    prCount = prSearch.total_count || 0;
  } catch {
    // Search API may be rate limited; fallback to 0
  }

  let totalCommits = 0;
  try {
    const commitSearch = await fetchJSON(
      `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}&per_page=1`
    );
    totalCommits = commitSearch.total_count || 0;
  } catch {
    // Search API may be rate limited; fallback to 0
  }

  return { profile, repos, events, prCount, totalCommits };
}
