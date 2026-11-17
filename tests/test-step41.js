#!/usr/bin/env node
/* Step 41a — download page redesign: static contract.
   The page is manifest-driven (standards/RELEASES.md): statically it
   is the honest floor (nothing published, no invented version or
   size); the four platform cards exist in the fixed order; only
   Windows carries (disabled) buttons; app.js validates the manifest
   hard and renders with textContent only. */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "website", "download.html"), "utf8");
const js = fs.readFileSync(path.join(root, "website", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "website", "styles.css"), "utf8");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

// 1. Recommendation panel + platform grid exist.
check("dl: recommendation panel and platform grid present",
  html.includes('id="dl-rec"') && html.includes('id="dl-platforms"') &&
  html.includes('id="dl-rec-live"') && html.includes('id="dl-after"') &&
  html.includes('id="dl-whatsnew"') && html.includes('id="dl-all"'));

// 2. Four cards in the fixed DOM order windows, android, ios, mac.
const order = [...html.matchAll(/data-platform="(\w+)"/g)].map((m) => m[1]);
check("dl: cards in fixed order windows/android/ios/mac",
  JSON.stringify(order) === JSON.stringify(["windows", "android", "ios", "mac"]));

// 3. Static honesty: no version number, no file size, no live href
//    to any binary anywhere on the static page.
check("dl: static page invents no version, size or binary link",
  !/Version \d/.test(html) && !/\d+(\.\d+)?\s?MB/.test(html) &&
  !/href="[^"]+\.(exe|zip|apk|dmg|pkg)"/i.test(html));

// 4. The honest status sentences survive the redesign.
check("dl: not-yet-published honesty intact",
  html.includes("Signed installer + SHA-256: not yet published") &&
  html.includes("The buttons below will go live with the first signed release") &&
  html.includes("we will not link a file that does not exist"));

// 5. The only static buttons are the recommendation panel's two
//    Windows buttons, both disabled; all four cards are status-only
//    (no link, no button) until the manifest fills them.
const cards = html.split('<article class="card dl-card"').slice(1)
  .map((seg) => seg.split("</article>")[0]);
check("dl: four cards parsed", cards.length === 4);
const panel = html.split('id="dl-platforms"')[0];
check("dl: panel keeps the two disabled Windows buttons",
  panel.includes('id="dl-installer"') && panel.includes('id="dl-portable"') &&
  (panel.match(/disabled/g) || []).length >= 2);
check("dl: all four cards are status-only statically",
  cards.every((c) => !/<a\s/.test(c) && !/<button/.test(c)));

// 6. Unreleased statuses mirror platforms.html wording.
check("dl: planned statuses mirror the platforms page",
  html.includes("Planned — Phase 3. No APK, no date.") &&
  (html.match(/feasibility still being researched\. No date\./g) || []).length === 2);

// 7. app.js: endpoint declared empty (wiring is Step 41c), the IIFE
//    exists, validates hard, and renders without innerHTML.
check("js: IA_RELEASES_ENDPOINT declared empty for 41a",
  js.includes('var IA_RELEASES_ENDPOINT = "";'));
const iifeStart = js.indexOf("/* Step 41 — download page");
const iifeEnd = js.indexOf("/* Step 25 — chip-row fade edge");
check("js: download IIFE present", iifeStart > 0 && iifeEnd > iifeStart);
const iife = js.slice(iifeStart, iifeEnd);
check("js: manifest validation enforces https + 64-hex sha",
  iife.includes("/^https:\\/\\//") && iife.includes("[0-9a-f]{64}"));
check("js: download IIFE never uses innerHTML", !/\.innerHTML/.test(iife));
check("js: ordering rule implemented (detected, then windows)",
  iife.includes("byPlatform[detected]") && iife.includes('first = "windows"'));
check("js: detection uses userAgentData with UA fallback",
  iife.includes("navigator.userAgentData") && iife.includes("navigator.userAgent"));

// 8. styles: the dl components exist; the retired installer mockup
//    classes are gone (dead code standard).
check("css: dl components styled",
  css.includes(".dl-rec {") && css.includes(".dl-card-head") &&
  css.includes(".dl-sha {") && css.includes(".dl-after {"));
check("css: retired installer classes removed",
  !/\.inst-(body|file|progress|status|sha)/.test(css) && !/\.installer \{/.test(css));

// 9. The standard exists and states the ordering rule.
const std = fs.readFileSync(path.join(root, "standards", "RELEASES.md"), "utf8");
check("standards: RELEASES.md states manifest + ordering contract",
  std.includes("manifest is the only source of truth") &&
  std.includes("The visitor's detected platform"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
