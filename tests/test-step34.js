#!/usr/bin/env node
/* Step 34 — two owner-directed refinements to the app window:
   - the answer-source label for a live-generated answer reads
     "live", never "AI" (and never "prepared", which would be
     false for a typed question — "live" is exactly what
     happened). The demo's status sentence matches:
     "Live answer — generated for this question.";
   - the window header is slimmer and sleeker: vertical padding
     12px -> 8px (a 46px bar, still one row for every status
     word, still constant through the play — STABILITY), the
     Start button's radius joins the status pill's capsule
     family (14px), and the caption glyphs (stop, minimise,
     maximise, close) are one inline-SVG family at a matched
     optical size instead of font glyphs. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const html = fs.readFileSync(path.join(ROOT, "website", "index.html"), "utf8");
const heroJs = (js.split("Step 21 — hero")[1] || "").split("Steps 21–22 — scroll story")[0];

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

/* ---------- the label ---------- */
check("the hero's live-generated meta word is \"live\", in both askAI paths",
  /STYLE_META\[styleName\] \|\| "live"/.test(heroJs) &&
  /prepareDynamic\(bullets, "live", "typed-ai"\)/.test(heroJs) &&
  !/prepareDynamic\(bullets, "AI"/.test(heroJs) &&
  !/\|\| "AI"/.test(heroJs));
check("the demo's status sentence matches (no \"AI\")",
  js.includes('"Live answer — generated for this question."') &&
  !js.includes("Live AI answer"));

/* ---------- the slim header ---------- */
check("the header's vertical padding is 8px (a 46px bar)",
  /\.app-header \{\s*display: flex; align-items: center; gap: 12px;\s*padding: 8px 16px;/.test(clean));
check("the header controls share one radius family (14px in Step 34; Step 35 set both to the chips' 8px at the owner's direction)",
  /\.app-start \{[^}]*border-radius: 8px;/.test(clean) &&
  /\.app-pill \{[^}]*border-radius: 8px;/.test(clean));
check("no caption glyph survives as text in the app windows",
  !html.includes("■") && !html.includes("▢") &&
  !/<span class="app-win-btn"[^>]*>×<\/span>/.test(html) &&
  !/<i>×<\/i>/.test(html));
check("the caption icons are one SVG family (stop x8, close x8, min x3, max x3 incl. home bars)",
  (html.match(/<rect x="4" y="4" width="8" height="8" rx="2" fill="currentColor"\/>/g) || []).length === 8 &&
  (html.match(/M4\.2 4\.2 L11\.8 11\.8/g) || []).length === 10 &&
  (html.match(/<path d="M4 8 H12"/g) || []).length === 3 &&
  (html.match(/rx="2" fill="none" stroke="currentColor"/g) || []).length === 3);
check("the SVG sizing rules exist (16px in the live header, 14px in the home bar)",
  /\.app-stop svg, \.app-win-btn svg \{ display: block; width: 16px; height: 16px; \}/.test(clean) &&
  /\.app-controls svg \{ display: block; width: 14px; height: 14px; \}/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
