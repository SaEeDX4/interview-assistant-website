/* Step 12 — color & contrast standard. Run: node tests/test-step12.js
   (from ~/workspace/interview-assistant-website).
   The standard (COLOR.md): every color comes from a :root token (no hex
   outside :root), rgba() tints use token hues only, and every text /
   background pair is >= 4.5:1 by the WCAG relative-luminance formula
   (recomputed here, not eyeballed). */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const cssRaw = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

const noComments = cssRaw.replace(/\/\*[\s\S]*?\*\//g, "");
const rootMatch = noComments.match(/:root\s*\{([^}]*)\}/);
const tokens = {};
if (rootMatch) {
  for (const m of rootMatch[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();
}

// 1. No hex color outside :root.
const outsideRoot = noComments.replace(/:root\s*\{[^}]*\}/, "");
const strayHex = outsideRoot.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
check("no hex color outside :root (all colors are tokens)",
  strayHex.length === 0, [...new Set(strayHex)].join(", "));

// 2. The new Step 12 tokens exist.
const newTokens = ["accent-light", "accent-hover", "accent-2-light", "coach-light",
  "warn-light", "danger", "danger-light", "danger-soft", "surface-mid", "skeleton"];
check("Step 12 tokens exist in :root",
  newTokens.every((t) => tokens[t] !== undefined),
  newTokens.filter((t) => tokens[t] === undefined).join(", "));
check("no second dark text color (#221a05) and no duplicate lavenders/teals",
  !/#221a05|#c6bdff|#5eead4/.test(noComments));

// 3. rgba() tints use token hues only.
const allowedHues = new Set([
  "124,108,255", "45,212,191", "245,185,78", "248,113,113", "52,211,153",
  "255,255,255", "0,0,0", "10,12,16", "14,18,24", "18,22,30", "23,29,40",
]);
let badHues = [];
for (const m of noComments.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g)) {
  const hue = `${Number(m[1])},${Number(m[2])},${Number(m[3])}`;
  if (!allowedHues.has(hue)) badHues.push(hue);
}
check("every rgba() tint is an alpha overlay of a token hue",
  badHues.length === 0, [...new Set(badHues)].join(", "));

// 4. Contrast: recompute every text/background pair (WCAG formula).
function lum(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function composite(rgba, bgHex) {
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  const a = Number(m[4]);
  const bg = [0, 2, 4].map((i) => parseInt(bgHex.replace("#", "").slice(i, i + 2), 16));
  const out = [1, 2, 3].map((i) => Math.round(Number(m[i]) * a + bg[i - 1] * (1 - a)));
  return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
}
const pairs = [
  ["text", "bg"], ["text", "surface"], ["text", "surface-2"],
  ["muted", "bg"], ["muted", "surface"], ["muted", "surface-2"],
  ["muted-2", "bg"], ["muted-2", "surface"], ["muted-2", "surface-2"],
  ["accent", "bg"], ["accent-2", "bg"], ["coach", "bg"], ["good", "bg"],
  ["warn", "bg"], ["focus", "bg"],
  ["bg", "accent"], ["bg", "coach"], ["bg", "accent-2"], ["bg", "accent-hover"],
  ["danger", "bg"], ["danger-light", "bg"], ["accent-light", "bg"],
  ["accent-2-light", "bg"], ["coach-light", "bg"], ["warn-light", "bg"],
];
let contrastOk = true, contrastNotes = [], worst = 99;
for (const [fg, bg] of pairs) {
  if (!tokens[fg] || !tokens[bg]) { contrastOk = false; contrastNotes.push(`${fg}/${bg}: missing token`); continue; }
  const r = ratio(tokens[fg], tokens[bg]);
  worst = Math.min(worst, r);
  if (r < 4.5) { contrastOk = false; contrastNotes.push(`${fg} on ${bg}: ${r.toFixed(2)}:1`); }
}
if (tokens["accent-light"] && tokens["accent-soft"] && tokens.bg) {
  const badgeAccent = ratio(tokens["accent-light"], composite(tokens["accent-soft"], tokens.bg));
  if (badgeAccent < 4.5) { contrastOk = false; contrastNotes.push(`accent-light on accent-soft: ${badgeAccent.toFixed(2)}:1`); }
  worst = Math.min(worst, badgeAccent);
} else { contrastOk = false; contrastNotes.push("accent-light/accent-soft tokens missing"); }
if (tokens.danger && tokens["danger-soft"] && tokens.bg) {
  const badgeDanger = ratio(tokens.danger, composite(tokens["danger-soft"], tokens.bg));
  if (badgeDanger < 4.5) { contrastOk = false; contrastNotes.push(`danger on danger-soft: ${badgeDanger.toFixed(2)}:1`); }
  worst = Math.min(worst, badgeDanger);
} else { contrastOk = false; contrastNotes.push("danger/danger-soft tokens missing"); }
check(`every text/background pair >= 4.5:1 (worst ${worst.toFixed(2)}:1)`,
  contrastOk, contrastNotes.join(" | "));

// 5. Regressions.
check("step11: btn-small padding 12px (44px target) still present",
  /\.btn-small\s*\{\s*padding:\s*12px 16px;\s*font-size:\s*15px;\s*\}/.test(noComments));
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(noComments) && !/font-weight:\s*750/.test(noComments) && !/font:\s*650\s/.test(noComments));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(noComments));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
