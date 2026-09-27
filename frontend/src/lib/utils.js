// ── Utilities ──────────────────────────────────────────────

export const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

export function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const yrs = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (yrs >= 1) return yrs + "yr" + (yrs > 1 ? "s" : "") + " ago";
  const mos = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (mos >= 1) return mos + "mo ago";
  return "recently";
}

export function accountAge(createdAt) {
  const years = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (years < 1)  return "Rookie";
  if (years < 3)  return "Veteran";
  return "Legend";
}

export function getTypeIcon(type) {
  const icons = {
    fire:"🔥", water:"💧", grass:"🌿", electric:"⚡", psychic:"🔮",
    ghost:"👻", dragon:"🐉", dark:"🌑", steel:"⚙️", fighting:"👊",
    flying:"🌬️", poison:"☠️", ground:"🌍", rock:"🪨", ice:"❄️",
    fairy:"✨", normal:"⭐", colorless:"⭐"
  };
  return icons[type] || "⭐";
}

export function getStreakLevel(recentCommits) {
  if (recentCommits >= 30) return { label: "Legendary 🔥🔥🔥", color: "#FF6B35" };
  if (recentCommits >= 15) return { label: "On Fire 🔥🔥",    color: "#FDD835" };
  if (recentCommits >= 5)  return { label: "Active 🔥",         color: "#4CAF50" };
  if (recentCommits >= 1)  return { label: "Getting Started ⚡", color: "#64B5F6" };
  return { label: "New Trainer 🌱", color: "#A5D6A7" };
}
