#!/usr/bin/env node
/* Step 50 — Cross-document View Transitions (static checks).
   Every page opts in through the shared stylesheet: the sticky
   header is a named transition element that never animates (it
   reads as persistent), the root cross-fades with the house easing,
   and reduced-motion users get an instant swap. Browsers without
   support must see exactly the old behaviour, so the feature is
   CSS-only — no script may gate navigation on it. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}

const css = read("website/styles.css");
const start = css.indexOf("/* Step 50");
check("Step 50 view-transition block exists in styles.css", start > 0);
const vt = css.slice(start);

check("cross-document transitions opted in", vt.includes("@view-transition { navigation: auto; }"));
check("sticky header is the named persistent element",
  vt.includes(".site-header { view-transition-name: site-header; }"));
check("header snapshots never animate (persistence illusion)",
  vt.includes("::view-transition-old(site-header)") && vt.includes("animation: none; }"));
check("outgoing page fades", vt.includes("::view-transition-old(root) { animation: ia-vt-out .18s ease both; }"));
check("incoming page rises with the house easing",
  vt.includes("::view-transition-new(root) { animation: ia-vt-in .32s cubic-bezier(.2,.7,.3,1) both; }"));
check("rise distance is on the spacing scale (12px)", vt.includes("transform: translateY(12px)"));
check("reduced-motion disables transition animations",
  /@media \(prefers-reduced-motion: reduce\) \{\s*::view-transition-old\(root\),\s*::view-transition-new\(root\),\s*::view-transition-old\(site-header\),\s*::view-transition-new\(site-header\) \{ animation: none; \}/.test(vt));
check("no second view-transition-name anywhere in CSS (uniqueness)",
  (css.match(/view-transition-name/g) || []).length === 1);

const pages = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "platforms.html", "pricing.html", "download.html", "support.html",
  "privacy.html", "terms.html", "404.html"];
for (const p of pages) {
  const html = read("website/" + p);
  check(p + " opts in via the shared stylesheet", html.includes('href="styles.css"'));
  check(p + " declares no inline view-transition-name", !html.includes("view-transition-name"));
}
const appJs = read("website/app.js");
check("app.js never gates navigation on view transitions", !appJs.includes("startViewTransition"));

console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
