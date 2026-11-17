#!/usr/bin/env node
/* Step 35 — the owner's shape rule, enforced: buttons are
   rectangular with a small rounding; no capsule (999px) radius
   on any button or control anywhere in the design system.
   Small controls take 8px, large controls 12px (standards/
   RADIUS.md). The only 999px radii left are the exempt
   progress/meter tracks and the range slider tracks. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}
function rule(selector) {
  // Any block for the selector may carry the radius (some selectors
  // have an earlier layout-only block), so search every block.
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blocks = clean.match(new RegExp(esc + " \\{[^}]*\\}", "g")) || [];
  return blocks.join("\n");
}

check(".btn is rectangular (12px), no longer a capsule",
  /border-radius: 12px;/.test(rule(".btn")));
check("the app's status pill and Start button match the chips at 8px",
  /border-radius: 8px;/.test(rule(".app-pill")) &&
  /border-radius: 8px;/.test(rule(".app-start")) &&
  /border-radius: 8px;/.test(rule(".app-chip")));
check("large controls take 12px (.chip, .radio-pill, .ethics-link, segmented containers)",
  /border-radius: 12px;/.test(rule(".chip")) &&
  /border-radius: 12px;/.test(rule(".radio-pill")) &&
  /border-radius: 12px;/.test(rule(".ethics-link")) &&
  /border-radius: 12px;/.test(rule(".mode-toggle")) &&
  /border-radius: 12px;/.test(rule(".seg")));
check("small labels take 8px (.pill, .badge, privacy never-chips)",
  /border-radius: 8px;/.test(rule(".pill")) &&
  /border-radius: 8px;/.test(rule(".badge")) &&
  /\.ethics-nevers li \{[^}]*border-radius: 8px;/.test(clean));
check("the only 999px radii left are the four exempt track/bar rules",
  (clean.match(/border-radius: 999px/g) || []).length === 4 &&
  /\.calc input\[type="range"\]/.test(clean) &&
  /\.meter-track \{[^}]*border-radius: 999px;/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
