/* Step 15 — breakpoints standard. Run: node tests/test-step15.js
   (from ~/workspace/interview-assistant-website).
   The standard (BREAKPOINTS.md): the only max-widths are 384/480/640/
   860/900/1024 (384 added by Step 29 — a computed threshold, see
   BREAKPOINTS.md); no min-width queries; JS has no width logic;
   feature queries are separate. The Step 15 audit found no
   violations, so there is no fix script — this test locks in what
   the audit found. */
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

// 1. Closed breakpoint set.
const widths = [...clean.matchAll(/@media\s*\(max-width:\s*(\d+)px\)/g)].map((m) => Number(m[1]));
const ALLOWED = new Set([384, 480, 640, 860, 900, 1024]);
const bad = [...new Set(widths)].filter((w) => !ALLOWED.has(w));
check("every max-width is in the closed set {384, 480, 640, 860, 900, 1024}",
  bad.length === 0, `off-set widths: ${bad.join(", ")}`);
check("each documented breakpoint is used",
  [384, 480, 640, 860, 900, 1024].every((w) => widths.includes(w)),
  `used: ${[...new Set(widths)].sort((a, b) => a - b).join(", ")}`);
check("no min-width media queries (one direction: desktop-first)",
  !/@media\s*\(min-width:/.test(clean));

// 2. The single-rule breakpoints still do their job.
check("900px hides the sticky bar text",
  /@media \(max-width: 900px\)\s*\{\s*\.sticky-cta-text\s*\{\s*display:\s*none;\s*\}\s*\}/.test(clean));
check("480px compacts the sticky bar (secondary hidden, primary stretches)",
  /@media \(max-width: 480px\)\s*\{[\s\S]*?\.sticky-cta \.btn-secondary\s*\{\s*display:\s*none;\s*\}[\s\S]*?\.sticky-cta \.btn-primary\s*\{\s*flex:\s*1 1 auto;\s*\}/.test(clean));

// 3. Feature queries are separate and present.
check("feature queries present (reduced-motion x2, forced-colors x2, hover x1)",
  (clean.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 2
  && (clean.match(/@media \(forced-colors: active\)/g) || []).length === 2
  && (clean.match(/@media \(hover: hover\)/g) || []).length === 1);

// 4. JS has no width logic.
check("app.js uses matchMedia only for prefers-reduced-motion",
  ![...js.matchAll(/matchMedia\("([^"]+)"\)/g)].some((m) => !m[1].includes("prefers-reduced-motion"))
  && !/innerWidth|outerWidth/.test(js));

// 5. Regressions (only steps whose fixes are applied).
check("step11: btn-small padding 12px (44px target) still present",
  /\.btn-small\s*\{\s*padding:\s*12px 16px;\s*font-size:\s*15px;\s*\}/.test(clean));
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(clean) && !/font-weight:\s*750/.test(clean) && !/font:\s*650\s/.test(clean));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(clean));

check("step19: mobile nav dropdown at 1024px, not 860px (header fits 861-1039)",
  /@media \(max-width: 1024px\) \{\s*\.site-nav \{\s*display: none;/.test(clean)
  && !/@media \(max-width: 860px\) \{\s*\.site-nav \{\s*display: none;/.test(clean));
check("step19: nav-link padding 12px 4px (header fits at 1025px)",
  /\.site-nav a\s*\{[^}]*padding:\s*12px 4px;/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
