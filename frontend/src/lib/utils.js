// ── Utilities ──────────────────────────────────────────────

export const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

export function fmt(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return Number(n).toLocaleString();
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
  if (years < 1)  return "Cadet";
  if (years < 3)  return "Veteran";
  return "Deep Space Pioneer";
}

export function generateShipId(username = "", userId = 0) {
  let hash = 0;
  const str = String(username).toLowerCase() + String(userId || "");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const positive = Math.abs(hash) % 10000;
  return `#${String(positive).padStart(4, "0")}`;
}

export function getStreakLevel(recentCommits) {
  if (recentCommits >= 30) return { label: "Hyperdrive Max ⚡⚡⚡", color: "#38BDF8" };
  if (recentCommits >= 15) return { label: "Warp Speed 🛸🛸",   color: "#818CF8" };
  if (recentCommits >= 5)  return { label: "Sub-light Pulse 🚀", color: "#34D399" };
  if (recentCommits >= 1)  return { label: "Thrusters Engaged 🛰️", color: "#FBBF24" };
  return { label: "Orbit Standby 📡", color: "#94A3B8" };
}

export function getTypeIcon(type) {
  const icons = {
    solaris: "☀️",
    nebula: "🌌",
    quantum: "⚛️",
    titanium: "🛡️",
    nova: "💫",
    crimson: "🔴",
    forge: "🔥",
    prism: "💎",
    ember: "✨",
    astral: "🔮",
    comet: "☄️",
    aurora: "🌈",
    pulsar: "🏮",
    void: "🕳️",
    spectrum: "🎨",
    cosmos: "🪐",
  };
  return icons[String(type).toLowerCase()] || "🪐";
}
