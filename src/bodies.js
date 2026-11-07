// The body sprite sheet (assets/bodies-dark.png) is a 6x6 grid of 512x512
// cells: one row per body color, one column per growth stage (smallest to
// largest), reused under MIT from yalongwastaken/git-koi's docs/bodies-dark.png.
// See NOTICE.md.

const CELL = 512;
const GRID = 6;

// Each row's representative body color, sampled from the sheet itself, used
// to pick the row whose color is nearest the account's top-language color.
const ROW_COLORS = [
  [192, 203, 220], // row 0: pale silver
  [38, 43, 68],    // row 1: dark navy
  [254, 174, 52],  // row 2: orange
  [184, 111, 80],  // row 3: brown
  [254, 231, 97],  // row 4: yellow-gold
  [192, 203, 220], // row 5: pale platinum (close to row 0)
];

const GROWTH_STEPS = [50, 200, 500, 1000, 2000]; // 6 columns total

function nearestRow([r, g, b]) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < ROW_COLORS.length; i++) {
    const [rr, rg, rb] = ROW_COLORS[i];
    const dist = (r - rr) ** 2 + (g - rg) ** 2 + (b - rb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function growthColumn(totalContributions) {
  for (let i = 0; i < GROWTH_STEPS.length; i++) {
    if (totalContributions < GROWTH_STEPS[i]) return i;
  }
  return GROWTH_STEPS.length; // last column
}

module.exports = { CELL, GRID, nearestRow, growthColumn };
