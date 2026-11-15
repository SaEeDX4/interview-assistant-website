/* Step 14 — motion standard. Run: node tests/test-step14.js
   (from ~/workspace/interview-assistant-website).
   The standard (MOTION.md): transition durations only 150/250/300ms;
   one entrance curve cubic-bezier(.2,.7,.3,1); rise is 250ms everywhere;
   ambient loops keep their durations (meter 1.1s, pulse 0.9s, floaty 5s);
   the app window is flat (no tilt, Step 21); reduced motion kills all
   animation/transition; JS gates its animation paths on matchMedia.
   (Step 23 retired the shimmer 1.2s skeleton sweep with the demo
   skeletons — the bullets are pre-rendered now, so there is nothing to
   sweep.) */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. Transition durations: only .15s / .25s / .3s.
const TRANS_DURATIONS = new Set([".15s", ".25s", ".3s"]);
let transOk = true, transNotes = [];
for (const m of clean.matchAll(/transition:\s*([^;]+);/g)) {
  for (const d of m[1].match(/[\d.]+s/g) || []) {
    if (!TRANS_DURATIONS.has(d)) { transOk = false; transNotes.push(`transition ${m[1].trim()} (off-standard ${d})`); }
  }
}
check("every transition duration is 150/250/300ms", transOk, [...new Set(transNotes)].join(" | "));

// 2. One entrance curve, one spelling.
const curves = clean.match(/cubic-bezier\([^)]+\)/g) || [];
check("the rise curve has one spelling: cubic-bezier(.2,.7,.3,1)",
  curves.length > 0 && curves.every((c) => c === "cubic-bezier(.2,.7,.3,1)"),
  [...new Set(curves)].join(", "));

// 3. Animations: rise 250ms everywhere; named loops keep their durations.
const anims = [...clean.matchAll(/animation:\s*(\w+)\s+([\d.]+s)/g)];
const riseOk = anims.filter(([_, name]) => name === "rise").every(([_, __, dur]) => dur === ".25s")
  && anims.some(([_, name]) => name === "rise");
const loopOk = anims.some(([_, n, d]) => n === "meter" && d === "1.1s")
  && anims.some(([_, n, d]) => n === "pulse" && d === ".9s")
  && anims.some(([_, n, d]) => n === "floaty" && d === "5s")
  && !/shimmer/.test(clean);
check("rise is 250ms in both places (demo + hero mock)", riseOk,
  anims.filter(([_, n]) => n === "rise").map((a) => a[0]).join(" | "));
check("ambient loops keep their durations (meter 1.1s, pulse 0.9s, floaty 5s; shimmer retired Step 23)", loopOk);

// 4. Reduced motion.
check("reduced motion kills all animation/transition + scroll-behavior auto",
  /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?scroll-behavior:\s*auto;[\s\S]*?animation:\s*none !important;\s*transition:\s*none !important;/.test(clean));
check("no 3D tilt on the app window anywhere (flat by design, Step 21)",
  !/rotateY|perspective\(1400px\)/.test(clean));
check("JS gates animation paths on prefers-reduced-motion",
  (js.match(/matchMedia\("\(prefers-reduced-motion: reduce\)"\)/g) || []).length >= 2);

// 5. Regressions.
check("step11: btn-small padding 12px (44px target) still present",
  /\.btn-small\s*\{\s*padding:\s*12px 16px;\s*font-size:\s*15px;\s*\}/.test(clean));
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(clean) && !/font-weight:\s*750/.test(clean) && !/font:\s*650\s/.test(clean));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
