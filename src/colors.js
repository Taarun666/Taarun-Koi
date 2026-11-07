// A small subset of GitHub's linguist language colors, enough to cover
// common languages. Falls back to a neutral gray for anything unlisted.

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Jupyter: "#DA5B0B",
};

const DEFAULT_COLOR = "#888888";

function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] || DEFAULT_COLOR;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return [r, g, b];
}

function shade(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return [clamp(r * factor), clamp(g * factor), clamp(b * factor)];
}

module.exports = { getLanguageColor, hexToRgb, shade, DEFAULT_COLOR };
