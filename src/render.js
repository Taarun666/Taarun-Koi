const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const { GIFEncoder, quantize, applyPalette } = require("gifenc");
const { CELL, nearestRow, growthColumn } = require("./bodies");
const { getLanguageColor, hexToRgb } = require("./colors");

const SPRITE_SHEET = path.join(__dirname, "..", "assets", "bodies-dark.png");
const OUTPUT_SIZE = 300;

// The sheet is a documentation image with GitHub's dark-mode page color
// (#0d1117) baked in as an opaque backdrop, not real transparency. Key it
// out so the rendered GIF blends into the profile README on any theme.
const BACKDROP = [13, 17, 23];
const BACKDROP_TOLERANCE = 20;

function keyOutBackdrop(rgba) {
  const out = new Uint8Array(rgba);
  for (let i = 0; i < out.length; i += 4) {
    const dr = out[i] - BACKDROP[0];
    const dg = out[i + 1] - BACKDROP[1];
    const db = out[i + 2] - BACKDROP[2];
    if (Math.sqrt(dr * dr + dg * dg + db * db) <= BACKDROP_TOLERANCE) {
      out[i + 3] = 0;
    }
  }
  return out;
}

function delayForActivity(todayContributions) {
  if (todayContributions <= 0) return 320;
  if (todayContributions < 4) return 200;
  if (todayContributions < 10) return 120;
  return 70;
}

// Shifts an RGBA buffer vertically by `shiftPx`, filling revealed rows with
// transparency, for a gentle two-frame swim bob.
function shiftVertical(rgba, width, height, shiftPx) {
  const out = new Uint8Array(rgba.length);
  for (let y = 0; y < height; y++) {
    const srcY = y - shiftPx;
    if (srcY < 0 || srcY >= height) continue;
    const srcStart = srcY * width * 4;
    const dstStart = y * width * 4;
    out.set(rgba.subarray(srcStart, srcStart + width * 4), dstStart);
  }
  return out;
}

async function cropCell(row, col) {
  const { data } = await sharp(SPRITE_SHEET)
    .extract({ left: col * CELL, top: row * CELL, width: CELL, height: CELL })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const keyed = keyOutBackdrop(data);

  const { data: resized, info } = await sharp(Buffer.from(keyed), {
    raw: { width: CELL, height: CELL, channels: 4 },
  })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE)
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { rgba: new Uint8Array(resized.buffer, resized.byteOffset, resized.length), width: info.width, height: info.height };
}

async function renderKoi(snapshot, outputDir) {
  const bodyColor = getLanguageColor(snapshot.topLanguage);
  const row = nearestRow(hexToRgb(bodyColor));
  const col = growthColumn(snapshot.totalContributions);
  const delay = delayForActivity(snapshot.todayContributions);

  const base = await cropCell(row, col);
  const bobbed = {
    ...base,
    rgba: shiftVertical(base.rgba, base.width, base.height, 3),
  };

  const gif = GIFEncoder();
  for (const frame of [base, bobbed, base, bobbed]) {
    const palette = quantize(frame.rgba, 256, { format: "rgba4444" });
    const index = applyPalette(frame.rgba, palette, "rgba4444");
    gif.writeFrame(index, frame.width, frame.height, {
      palette,
      delay,
      transparent: true,
      transparentIndex: findTransparentIndex(frame.rgba, index),
    });
  }
  gif.finish();

  fs.mkdirSync(outputDir, { recursive: true });
  const gifPath = path.join(outputDir, "koi.gif");
  fs.writeFileSync(gifPath, Buffer.from(gif.bytes()));

  const previewPath = path.join(outputDir, "preview.html");
  fs.writeFileSync(previewPath, previewHtml(snapshot, bodyColor, row, col, delay));

  return { gifPath, previewPath, bodyColor, row, col, delay };
}

function findTransparentIndex(rgba, indexed) {
  for (let p = 0; p < rgba.length; p += 4) {
    if (rgba[p + 3] === 0) return indexed[p / 4];
  }
  return -1;
}

function previewHtml(snapshot, bodyColor, row, col, delay) {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Taarun-Koi preview</title></head>
  <body style="font-family: sans-serif; background: #0d1117; color: #e6edf3; padding: 2rem;">
    <h1>Taarun-Koi</h1>
    <img src="koi.gif" width="${OUTPUT_SIZE}" alt="koi preview" />
    <ul>
      <li>Account: ${snapshot.login}</li>
      <li>Total contributions: ${snapshot.totalContributions}</li>
      <li>Today's contributions: ${snapshot.todayContributions}</li>
      <li>Top language: ${snapshot.topLanguage || "none"} (${bodyColor}) -> sprite row ${row}</li>
      <li>Growth stage: column ${col}</li>
      <li>Frame delay: ${delay}ms</li>
    </ul>
  </body>
</html>`;
}

module.exports = { renderKoi, delayForActivity };
