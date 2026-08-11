// Sanity check for the anchor interpolation, run with: node scripts/check-scroll-sync.mjs
// Mirrors mapScroll from lib/scroll-sync.ts.

function mapScroll(value, anchors, sourceRange, targetRange, direction) {
  if (sourceRange <= 0 || targetRange <= 0) return 0;
  const proportional = (value / sourceRange) * targetRange;
  if (anchors.length === 0) return proportional;

  const from = (a) => (direction === "toPreview" ? a[0] : a[1]);
  const to = (a) => (direction === "toPreview" ? a[1] : a[0]);

  const points = [[0, 0], ...anchors.map((a) => [from(a), to(a)]), [sourceRange, targetRange]];

  for (let i = 0; i < points.length - 1; i++) {
    const [aFrom, aTo] = points[i];
    const [bFrom, bTo] = points[i + 1];
    if (value >= aFrom && value <= bFrom) {
      const span = bFrom - aFrom;
      const ratio = span <= 0 ? 0 : (value - aFrom) / span;
      return aTo + ratio * (bTo - aTo);
    }
  }
  return proportional;
}

let failures = 0;
const check = (label, actual, expected, tolerance = 0.01) => {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (!ok) failures++;
  console.log(`${ok ? "pass" : "FAIL"}  ${label}: got ${actual.toFixed(1)}, expected ${expected}`);
};

/*
 * A document whose panes grow at very different rates — the table-heavy case
 * that proportional mapping gets wrong. Editor is 4000px of source, preview
 * only 2000px of rendered output, and the middle section compresses hard.
 */
const anchors = [
  [500, 200],   // first heading
  [2500, 700],  // second heading: 2000px of source -> 500px rendered
  [3000, 1600], // third heading: 500px of source -> 900px rendered
];
const srcRange = 4000;
const prevRange = 2000;

check("heading 1 lines up", mapScroll(500, anchors, srcRange, prevRange, "toPreview"), 200);
check("heading 2 lines up", mapScroll(2500, anchors, srcRange, prevRange, "toPreview"), 700);
check("heading 3 lines up", mapScroll(3000, anchors, srcRange, prevRange, "toPreview"), 1600);
check("top stays at top", mapScroll(0, anchors, srcRange, prevRange, "toPreview"), 0);
check("bottom stays at bottom", mapScroll(4000, anchors, srcRange, prevRange, "toPreview"), 2000);
check(
  "midway through a compressed section",
  mapScroll(1500, anchors, srcRange, prevRange, "toPreview"),
  450
);

// The reverse direction has to land back where it started.
for (const y of [0, 500, 1500, 2500, 3000, 4000]) {
  const there = mapScroll(y, anchors, srcRange, prevRange, "toPreview");
  const back = mapScroll(there, anchors, prevRange, srcRange, "toSource");
  check(`round trip from ${y}`, back, y, 0.5);
}

// Proportional fallback when a document has no headings at all.
check("no anchors falls back", mapScroll(1000, [], 4000, 2000, "toPreview"), 500);

console.log(failures === 0 ? "\nall good" : `\n${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
