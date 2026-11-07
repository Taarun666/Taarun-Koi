const fs = require("node:fs");
const path = require("node:path");
const { GIFEncoder, quantize, applyPalette } = require("gifenc");
const { buildKoiGrid, WIDTH, HEIGHT } = require("./sprite");
const { getLanguageColor, hexToRgb, shade } = require("./colors");

const GROWTH_STEPS = [
  { max: 50, scale: 4 },
  { max: 200, scale: 6 },
  { max: 500, scale: 8 },
  { max: 1000, scale: 10 },
  { max: 2000, scale: 12 },
  { max: Infinity, scale: 14 },
];

function scaleForContributions(totalContributions) {
  const step = GROWTH_STEPS.find((s) => totalContributions < s.max);
  return step.scale;
}

function delayForActivity(todayContributions) {
  if (todayContributions <= 0) return 320;
  if (todayContributions < 4) return 200;
  if (todayContributions < 10) return 120;
  return 70;
}

function colorForCell(cell, bodyColor) {
  switch (cell) {
    case "body":
      return hexToRgb(bodyColor);
    case "fin":
    case "tail":
      return shade(bodyColor, 0.7);
    case "eye":
      return [20, 20, 20];
    case "outline":
      return [25, 25, 25];
    default:
      return null; // transparent
  }
}

function drawFrame(grid, scale, bodyColor) {
  const pxWidth = WIDTH * scale;
  const pxHeight = HEIGHT * scale;
  const rgba = new Uint8Array(pxWidth * pxHeight * 4);

  for (let gy = 0; gy < HEIGHT; gy++) {
    for (let gx = 0; gx < WIDTH; gx++) {
      const color = colorForCell(grid[gy][gx], bodyColor);
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const x = gx * scale + sx;
          const y = gy * scale + sy;
          const i = (y * pxWidth + x) * 4;
          if (color) {
            rgba[i] = color[0];
            rgba[i + 1] = color[1];
            rgba[i + 2] = color[2];
            rgba[i + 3] = 255;
          } else {
            rgba[i + 3] = 0; // transparent background
          }
        }
      }
    }
  }
  return { rgba, pxWidth, pxHeight };
}

function renderKoi(snapshot, outputDir) {
  const bodyColor = getLanguageColor(snapshot.topLanguage);
  const scale = scaleForContributions(snapshot.totalContributions);
  const delay = delayForActivity(snapshot.todayContributions);

  const frame0 = drawFrame(buildKoiGrid(0), scale, bodyColor);
  const frame1 = drawFrame(buildKoiGrid(1), scale, bodyColor);
  const { pxWidth, pxHeight } = frame0;

  const gif = GIFEncoder();
  for (const frame of [frame0, frame1, frame0, frame1]) {
    const palette = quantize(frame.rgba, 256, { format: "rgba4444" });
    const index = applyPalette(frame.rgba, palette, "rgba4444");
    gif.writeFrame(index, pxWidth, pxHeight, {
      palette,
      delay,
      transparent: true,
      transparentIndex: findTransparentIndex(frame.rgba, index, palette),
    });
  }
  gif.finish();

  fs.mkdirSync(outputDir, { recursive: true });
  const gifPath = path.join(outputDir, "koi.gif");
  fs.writeFileSync(gifPath, Buffer.from(gif.bytes()));

  const previewPath = path.join(outputDir, "preview.html");
  fs.writeFileSync(
    previewPath,
    previewHtml(snapshot, bodyColor, scale, delay)
  );

  return { gifPath, previewPath, bodyColor, scale, delay };
}

function findTransparentIndex(rgba, indexed, palette) {
  for (let p = 0; p < rgba.length; p += 4) {
    if (rgba[p + 3] === 0) {
      return indexed[p / 4];
    }
  }
  return -1;
}

function previewHtml(snapshot, bodyColor, scale, delay) {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Taarun-Koi preview</title></head>
  <body style="font-family: sans-serif; background: #0d1117; color: #e6edf3; padding: 2rem;">
    <h1>Taarun-Koi</h1>
    <img src="koi.gif" width="${scale * WIDTH}" alt="koi preview" />
    <ul>
      <li>Account: ${snapshot.login}</li>
      <li>Total contributions: ${snapshot.totalContributions}</li>
      <li>Today's contributions: ${snapshot.todayContributions}</li>
      <li>Top language: ${snapshot.topLanguage || "none"} (${bodyColor})</li>
      <li>Frame delay: ${delay}ms</li>
    </ul>
  </body>
</html>`;
}

module.exports = { renderKoi, scaleForContributions, delayForActivity };
