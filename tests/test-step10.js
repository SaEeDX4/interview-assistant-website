/* Step 10 — typography standard. Run: node tests/test-step10.js
   (from ~/workspace/interview-assistant-website).
   The standard (TYPOGRAPHY.md): every font-size is on the scale
   11/12/13/14/15/16/17/18/19/20/22/24/28/30/32/40/44/48/56/64/72, every
   weight is a used weight (400/500/600/700/800) inside the self-hosted
   variable range (100-900, Step 18), every line-height is one
   of 1/1.04/1.12/1.3/1.4/1.5/1.6/1.65, every letter-spacing is one of
   -0.03/-0.02/0/+0.04/+0.06/+0.08, and no reading-text block is wider than
   68ch. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

const SIZE_SCALE = new Set([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 28, 30, 32, 40, 44, 48, 56, 64, 72]);
const WEIGHTS = new Set([400, 500, 600, 700, 800]);
const LINE_HEIGHTS = new Set([1, 1.04, 1.12, 1.3, 1.4, 1.5, 1.6, 1.65]);
const TRACKING = new Set([-0.03, -0.02, 0, 0.04, 0.06, 0.08]);

const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const violations = [];
const usedWeights = new Set();
const blockRe = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = blockRe.exec(clean)) !== null) {
  const selector = m[1].trim().replace(/\s+/g, " ");
  if (selector.startsWith("@font-face")) continue; // Step 18: range declaration, not a used weight
  for (const decl of m[2].split(";")) {
    const colon = decl.indexOf(":");
    if (colon < 0) continue;
    const prop = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!value) continue;
    if (prop === "font-size") {
      if (/em|rem|%/.test(value)) { violations.push(`${selector} :: font-size ${value} (non-px)`); continue; }
      for (const n of value.match(/\d+(?:\.\d+)?(?=px)/g) || []) {
        if (!SIZE_SCALE.has(Number(n))) violations.push(`${selector} :: font-size ${value} (off-scale ${n}px)`);
      }
    } else if (prop === "font") {
      if (value === "inherit") continue;
      const sh = value.match(/^(\d+)\s+([\d.]+)px\/([\d.]+)/);
      if (!sh) { violations.push(`${selector} :: font ${value} (unparsable shorthand)`); continue; }
      usedWeights.add(Number(sh[1]));
      if (!WEIGHTS.has(Number(sh[1]))) violations.push(`${selector} :: font weight ${sh[1]} (not loaded)`);
      if (!SIZE_SCALE.has(Number(sh[2]))) violations.push(`${selector} :: font size ${sh[2]}px (off-scale)`);
      if (!LINE_HEIGHTS.has(Number(sh[3]))) violations.push(`${selector} :: font line-height ${sh[3]} (off-scale)`);
    } else if (prop === "font-weight") {
      usedWeights.add(Number(value));
      if (!WEIGHTS.has(Number(value))) violations.push(`${selector} :: font-weight ${value} (not loaded)`);
    } else if (prop === "line-height") {
      if (!LINE_HEIGHTS.has(Number(value))) violations.push(`${selector} :: line-height ${value} (off-scale)`);
    } else if (prop === "letter-spacing") {
      const num = value === "0" ? 0 : Number((value.match(/^(-?\.?\d+(?:\.\d+)?)em$/) || [])[1]);
      if (!TRACKING.has(num)) violations.push(`${selector} :: letter-spacing ${value} (off-scale)`);
    } else if (prop === "max-width" && /ch$/.test(value)) {
      if (Number(value.replace("ch", "")) > 68) violations.push(`${selector} :: max-width ${value} (too long to read)`);
    }
  }
}
check("every font-size/weight/line-height/tracking/line-length is on the standard",
  violations.length === 0, violations.slice(0, 10).join(" | "));

// 2. P0 fixes.
check("P0 honest-strip line length 68ch (was 100ch)",
  /\.honest-strip p\s*\{[^}]*max-width:\s*68ch/s.test(css));
check("P0 page-hero h1 clamp max 44px (was 46px)",
  /\.page-hero h1\s*\{\s*font-size:\s*clamp\(32px,\s*4\.4vw,\s*44px\);\s*\}/.test(css));
check("P0 no unloaded weights remain (650/750 gone)",
  !/font-weight:\s*650/.test(css) && !/font-weight:\s*750/.test(css) && !/font:\s*650\s/.test(css));
check("P0 no half-pixel font sizes remain",
  !/font-size:\s*\d+\.5px/.test(css) && !/font:\s*\d+\s+\d+\.5px/.test(css));

// 3. Every used weight is within the self-hosted variable range (Step 18:
//    Inter is a variable font, weights 100-900, served from fonts/).
const range = css.match(/@font-face\s*\{[^}]*font-weight:\s*(\d+)\s+(\d+)/) || [];
const lo = Number(range[1]), hi = Number(range[2]);
check("all used weights are within the self-hosted variable range (100-900)",
  Number.isFinite(lo) && Number.isFinite(hi) && [...usedWeights].every((w) => w >= lo && w <= hi),
  `used: ${[...usedWeights].sort().join(",")} range: ${lo}-${hi}`);

// 4. Hierarchy: exactly one h1 per page, no fully-uppercase headings.
let hierarchyOk = true, hierarchyNotes = [];
for (const f of fs.readdirSync(root).filter((x) => x.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(root, f), "utf8");
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) { hierarchyOk = false; hierarchyNotes.push(`${f}: ${h1s} h1s`); }
  for (const hm of html.matchAll(/<h[123][^>]*>([^<]*)<\/h[123]>/g)) {
    const text = hm[1].replace(/[^A-Za-z]/g, "");
    if (text.length > 3 && text === text.toUpperCase()) {
      hierarchyOk = false; hierarchyNotes.push(`${f}: all-caps heading "${hm[1].trim()}"`);
    }
  }
}
check("one h1 per page, no all-caps headings", hierarchyOk, hierarchyNotes.join(" | "));

// 5. Regressions: spacing standard + section rhythm still in force.
check("step9 spacing: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(css));
check("step8 rhythm: h2 48px / h3 28px still present",
  /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h2[^{]*\{[^}]*margin-top:\s*48px/s.test(css)
  && /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h3[^{]*\{[^}]*margin-top:\s*28px/s.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
