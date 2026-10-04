// ── Star Systems & Fleet Constants ───────────────────────────

export const STAR_SYSTEMS = {
  JavaScript: {
    name: "Solaris",
    color: "#F59E0B",
    light: "#FCD34D",
    dark: "#78350F",
    accent: "#FDE68A",
    lore: "Energy-based, powers everything",
    icon: "☀️",
  },
  Python: {
    name: "Nebula",
    color: "#8B5CF6",
    light: "#C4B5FD",
    dark: "#4C1D95",
    accent: "#DDD6FE",
    lore: "Mysterious, vast, adaptable",
    icon: "🌌",
  },
  TypeScript: {
    name: "Quantum",
    color: "#3B82F6",
    light: "#93C5FD",
    dark: "#1E3A8A",
    accent: "#BFDBFE",
    lore: "Precise, structured, powerful",
    icon: "⚛️",
  },
  Rust: {
    name: "Titanium",
    color: "#94A3B8",
    light: "#CBD5E1",
    dark: "#334155",
    accent: "#E2E8F0",
    lore: "Indestructible engineering",
    icon: "🛡️",
  },
  Go: {
    name: "Nova",
    color: "#06B6D4",
    light: "#67E8F9",
    dark: "#164E63",
    accent: "#A5F3FC",
    lore: "Fast, explosive, efficient",
    icon: "💫",
  },
  Java: {
    name: "Crimson",
    color: "#DC2626",
    light: "#FCA5A5",
    dark: "#7F1D1D",
    accent: "#FECACA",
    lore: "Ancient, massive, reliable",
    icon: "🔴",
  },
  "C++": {
    name: "Forge",
    color: "#F97316",
    light: "#FDBA74",
    dark: "#7C2D12",
    accent: "#FFEDD5",
    lore: "Raw power, forged in fire",
    icon: "🔥",
  },
  "C#": {
    name: "Prism",
    color: "#10B981",
    light: "#6EE7B7",
    dark: "#064E3B",
    accent: "#A7F3D0",
    lore: "Versatile, refractive",
    icon: "💎",
  },
  Ruby: {
    name: "Ember",
    color: "#F43F5E",
    light: "#FDA4AF",
    dark: "#881337",
    accent: "#FFE4E6",
    lore: "Elegant, radiant",
    icon: "✨",
  },
  PHP: {
    name: "Astral",
    color: "#6366F1",
    light: "#A5B4FC",
    dark: "#312E81",
    accent: "#C7D2FE",
    lore: "Everywhere, ethereal",
    icon: "🔮",
  },
  Swift: {
    name: "Comet",
    color: "#FB923C",
    light: "#FED7AA",
    dark: "#7C2D12",
    accent: "#FFEDD5",
    lore: "Fast-moving, sleek",
    icon: "☄️",
  },
  Kotlin: {
    name: "Aurora",
    color: "#A855F7",
    light: "#E9D5FF",
    dark: "#581C87",
    accent: "#F3E8FF",
    lore: "Modern, beautiful",
    icon: "🌈",
  },
  Scala: {
    name: "Pulsar",
    color: "#BE123C",
    light: "#FDA4AF",
    dark: "#4C0519",
    accent: "#FFE4E6",
    lore: "Rhythmic, pulsing power",
    icon: "🏮",
  },
  Shell: {
    name: "Void",
    color: "#64748B",
    light: "#94A3B8",
    dark: "#0F172A",
    accent: "#CBD5E1",
    lore: "Low-level, foundational",
    icon: "🕳️",
  },
  "HTML/CSS": {
    name: "Spectrum",
    color: "#EC4899",
    light: "#F472B6",
    dark: "#831843",
    accent: "#FCE7F3",
    lore: "Visual, colorful",
    icon: "🎨",
  },
  HTML: {
    name: "Spectrum",
    color: "#EC4899",
    light: "#F472B6",
    dark: "#831843",
    accent: "#FCE7F3",
    lore: "Visual, colorful",
    icon: "🎨",
  },
  CSS: {
    name: "Spectrum",
    color: "#EC4899",
    light: "#F472B6",
    dark: "#831843",
    accent: "#FCE7F3",
    lore: "Visual, colorful",
    icon: "🎨",
  },
  default: {
    name: "Cosmos",
    color: "#6366F1",
    light: "#818CF8",
    dark: "#1E1B4B",
    accent: "#C7D2FE",
    lore: "The infinite expanse",
    icon: "🪐",
  },
};

// ── Vulnerability Matrix ─────────────────────────────────────
export const VULNERABILITY_MAP = {
  Solaris:  { weakTo: "Void",     reason: "Light consumed by darkness" },
  Nebula:   { weakTo: "Quantum",  reason: "Chaos solved by precision" },
  Quantum:  { weakTo: "Ember",    reason: "Cold logic melted by passion" },
  Titanium: { weakTo: "Pulsar",   reason: "Rigid metal shattered by vibration" },
  Nova:     { weakTo: "Nebula",   reason: "Explosion absorbed by vastness" },
  Crimson:  { weakTo: "Comet",    reason: "Ancient overtaken by speed" },
  Forge:    { weakTo: "Prism",    reason: "Brute force deflected" },
  Prism:    { weakTo: "Forge",    reason: "Elegance overwhelmed by power" },
  Ember:    { weakTo: "Nova",     reason: "Flame blown out by explosion" },
  Astral:   { weakTo: "Titanium", reason: "Ethereal grounded by metal" },
  Comet:    { weakTo: "Quantum",  reason: "Speed trapped by precision" },
  Aurora:   { weakTo: "Void",     reason: "Beauty fades in darkness" },
  Pulsar:   { weakTo: "Solaris",  reason: "Pulses drowned by radiance" },
  Void:     { weakTo: "Spectrum", reason: "Darkness broken by light" },
  Spectrum: { weakTo: "Astral",   reason: "Colors dissolved into ether" },
  Cosmos:   { weakTo: "Void",     reason: "Cosmos succumbs to the void" },
};

// ── Clearance Levels ─────────────────────────────────────────
export const CLEARANCE_CONFIG = {
  standard: {
    id: "standard",
    label: "STANDARD",
    badge: "●",
    stars: 1,
    color: "#94A3B8",
    glow: "rgba(148, 163, 184, 0.25)",
    borderClass: "border-clearance-standard",
    lore: "Standard Fleet Issue",
  },
  classified: {
    id: "classified",
    label: "CLASSIFIED",
    badge: "◆",
    stars: 2,
    color: "#E2E8F0",
    glow: "rgba(226, 232, 240, 0.4)",
    borderClass: "border-clearance-classified",
    lore: "Elevated Security Tier",
  },
  "top-secret": {
    id: "top-secret",
    label: "TOP SECRET",
    badge: "★★★ TOP SEC",
    stars: 3,
    color: "#FBBF24",
    glow: "rgba(251, 191, 36, 0.6)",
    borderClass: "border-clearance-top-secret",
    lore: "High Command Clearance",
  },
  ultra: {
    id: "ultra",
    label: "ULTRA",
    badge: "★★★★ ULTRA",
    stars: 4,
    color: "#A855F7",
    glow: "rgba(168, 85, 247, 0.7)",
    borderClass: "border-clearance-ultra",
    lore: "Interstellar Black Tier",
  },
  "black-ops": {
    id: "black-ops",
    label: "BLACK OPS",
    badge: "✦ BLACK OPS",
    stars: 5,
    color: "#06B6D4",
    glow: "rgba(6, 182, 212, 0.85)",
    borderClass: "border-clearance-black-ops",
    lore: "Deep Space Operations",
  },
};

// ── Fleet Ranks ──────────────────────────────────────────────
export const FLEET_RANKS = [
  { minLvl: 81, title: "Fleet Admiral", short: "Flt Adm", badge: "★★", stripes: 5 },
  { minLvl: 51, title: "Admiral",       short: "Admiral", badge: "★",  stripes: 4 },
  { minLvl: 26, title: "Commander",     short: "Cmdr",    badge: "━━━", stripes: 3 },
  { minLvl: 11, title: "Lieutenant",    short: "Lt",      badge: "━━",  stripes: 2 },
  { minLvl: 1,  title: "Cadet",         short: "Cadet",   badge: "━",   stripes: 1 },
];

// ── Programming Language Color Palette ───────────────────────
export const LANG_COLORS = {
  JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3776AB",
  Rust: "#DEA584", Go: "#00ADD8", "C++": "#F34B7D", Ruby: "#CC342D",
  PHP: "#777BB4", Java: "#ED8B00", Kotlin: "#7F52FF", Swift: "#FA7343",
  "C#": "#239120", Dart: "#0175C2", Shell: "#89E051", Lua: "#000080",
  HTML: "#E34F26", CSS: "#1572B6", Vue: "#4FC08D", React: "#61DAFB",
  default: "#888888"
};

// Backward-compatibility aliases
export const LANG_TYPE = Object.fromEntries(
  Object.entries(STAR_SYSTEMS).map(([k, v]) => [k, v.name.toLowerCase()])
);
export const TYPE_COLORS = Object.fromEntries(
  Object.entries(STAR_SYSTEMS).map(([, v]) => [v.name.toLowerCase(), { bg: v.color, light: v.light, dark: v.dark }])
);
export const RARITY_CONFIG = CLEARANCE_CONFIG;
