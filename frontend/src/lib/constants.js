// ── Constants ──────────────────────────────────────────────

export const LANG_TYPE = {
  JavaScript: "electric", TypeScript: "water", Python: "psychic",
  Rust: "fire", Go: "grass", "C++": "fighting", Ruby: "fairy",
  PHP: "poison", Java: "rock", Kotlin: "dragon", Swift: "ice",
  "C#": "steel", Dart: "flying", Shell: "ground", Lua: "ghost"
};

export const TYPE_COLORS = {
  fire:      { bg: "#FF5722", light: "#FF8A65", dark: "#7C1500" },
  water:     { bg: "#1E88E5", light: "#64B5F6", dark: "#0A2D6B" },
  grass:     { bg: "#2ECC71", light: "#82E0AA", dark: "#0E5C32" },
  electric:  { bg: "#FFB300", light: "#FFE082", dark: "#7A4900" },
  psychic:   { bg: "#E91E8C", light: "#F48FB1", dark: "#7B0040" },
  ghost:     { bg: "#5C35B1", light: "#9575CD", dark: "#1A0072" },
  dragon:    { bg: "#3F51B5", light: "#7986CB", dark: "#1A1F6E" },
  dark:      { bg: "#546E7A", light: "#90A4AE", dark: "#1C313A" },
  steel:     { bg: "#607D8B", light: "#B0BEC5", dark: "#1C313A" },
  fighting:  { bg: "#D32F2F", light: "#EF9A9A", dark: "#7F0000" },
  flying:    { bg: "#7B1FA2", light: "#CE93D8", dark: "#38006B" },
  poison:    { bg: "#8E24AA", light: "#CE93D8", dark: "#4A0072" },
  ground:    { bg: "#E65100", light: "#FFCC80", dark: "#7A2700" },
  rock:      { bg: "#8D6E63", light: "#BCAAA4", dark: "#3E2723" },
  ice:       { bg: "#00ACC1", light: "#80DEEA", dark: "#006064" },
  fairy:     { bg: "#D81B60", light: "#F48FB1", dark: "#880E4F" },
  normal:    { bg: "#546E7A", light: "#90A4AE", dark: "#1C313A" }
};

export const RARITY_CONFIG = {
  "common":      { label: "●", color: "#888888", stars: 1 },
  "uncommon":    { label: "◆", color: "#4A90D9", stars: 2 },
  "holo-rare":   { label: "★", color: "#FFD700", stars: 3 },
  "ultra-rare":  { label: "★★", color: "#E040FB", stars: 4 },
  "secret-rare": { label: "✦", color: "#FF6B6B", stars: 5 }
};

export const LANG_COLORS = {
  JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3776AB",
  Rust: "#DEA584", Go: "#00ADD8", "C++": "#F34B7D", Ruby: "#CC342D",
  PHP: "#777BB4", Java: "#ED8B00", Kotlin: "#7F52FF", Swift: "#FA7343",
  "C#": "#239120", Dart: "#0175C2", Shell: "#89E051", Lua: "#000080",
  default: "#888888"
};

export const POKEMON_IDS = [
  3,6,9,12,25,31,34,38,45,59,65,68,76,94,103,105,110,113,121,130,
  131,132,143,149,150,151,157,196,197,212,248,249,250,254,257,260,
  282,330,373,376,380,381,384,386,395,398,445,448,487,493
];
