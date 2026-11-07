// Builds a koi fish as a grid of cell labels: null (background), 'body',
// 'fin', 'tail', 'eye', or 'outline'. `frame` (0 or 1) swaps the tail between
// an up and a down position for a simple swim wiggle.

const WIDTH = 24;
const HEIGHT = 12;

function buildKoiGrid(frame) {
  const grid = Array.from({ length: HEIGHT }, () => new Array(WIDTH).fill(null));

  // Body: an ellipse.
  const cx = 10;
  const cy = 6;
  const rx = 7;
  const ry = 3.3;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) grid[y][x] = "body";
    }
  }

  // Dorsal fin: a small triangle above the body's midpoint.
  const finCols = [[9, 2, 11], [9, 3], [10, 3]];
  grid[2][9] = "fin";
  grid[2][10] = "fin";
  grid[3][9] = "fin";
  grid[3][10] = "fin";

  // Tail: a triangle extending right from the body, apex up or down per frame.
  const tailBaseX = 16;
  for (let x = tailBaseX; x < WIDTH; x++) {
    const reach = x - tailBaseX; // 0..7
    const spread = Math.max(1, 3 - Math.floor(reach / 3));
    const centerY = frame === 0 ? cy - Math.floor(reach / 2) : cy + Math.floor(reach / 2);
    for (let dy = -spread; dy <= spread; dy++) {
      const y = centerY + dy;
      if (y >= 0 && y < HEIGHT && grid[y][x] === null) grid[y][x] = "tail";
    }
  }

  // Eye: a single pixel near the front (left side) of the body.
  const eyeX = 4;
  const eyeY = cy - 1;
  if (grid[eyeY] && grid[eyeY][eyeX] === "body") grid[eyeY][eyeX] = "eye";

  // Outline: any background cell adjacent to a non-background cell.
  const isFilled = (x, y) =>
    x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT && grid[y][x] !== null;
  const outlineCells = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] !== null) continue;
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
      ];
      if (neighbors.some(([nx2, ny2]) => isFilled(nx2, ny2))) {
        outlineCells.push([x, y]);
      }
    }
  }
  for (const [x, y] of outlineCells) grid[y][x] = "outline";

  return grid;
}

function gridToAscii(grid) {
  const glyphs = { body: "#", fin: "^", tail: "~", eye: "@", outline: "." };
  return grid
    .map((row) => row.map((cell) => (cell ? glyphs[cell] : " ")).join(""))
    .join("\n");
}

module.exports = { buildKoiGrid, gridToAscii, WIDTH, HEIGHT };
