/* Step 28 — the two alignments Saeed spotted on his phone in the Step 27
   live site (screenshot 2026-11-15 ~13:27 PST).
   Run: node tests/test-step28.js
   (from ~/workspace/interview-assistant-website).
   (1) Replay exactly above the blue send button, same centre. The geometry
   was proven by the Step 27 live measurement at 390px: the Replay button
   (x=313, w=44) and the send button (x=321, w=36) share a right edge
   (357), but the 36px box centred inside the 44px button had its centre
   at 335 vs the send's 339 — 4px left. Fix (research: Apple HIG "hit
   region", M3 fixed trailing slot): keep the 44px button, right-align the
   36×30 box inside it (place-items: center end). Both boxes are 36 wide
   and share the row's right edge, so their centres coincide exactly
   (339). Zero layout change: the button stays 44×44, the gap to the
   chips stays 8px, the row stays 44px, the hero height cannot move.
   (2) Sticky × uniform with the "Try the live demo" button. The × was
   44×44 while the button measures 50.75px tall (Step 27 live measurement)
   — a fixed 51px would drift the moment the button's font or padding
   changes, and no platform stretches a dismiss to match a primary
   (research: M3 snackbar and Fluent InfoBar use fixed-size dismisses;
   equality there comes from a shared fixed height). Fix: the dismiss
   stretches to the bar's content height (align-self: stretch) with
   aspect-ratio: 1, so it is always a square the same height as the
   button, with a 44px floor. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. Replay: the visible box is right-aligned inside its 44px button.
check("Replay box is right-aligned inside the button (place-items: center end)",
  /\.app-replay \{[\s\S]*?place-items: center end;/.test(clean));
check("Replay button is still 44×44 (the tap target, unchanged)",
  /\.app-replay \{[\s\S]*?width: 44px;[\s\S]*?height: 44px;/.test(clean));
check("Replay visible box is still 36×30 (chips' height, send button's width)",
  /\.app-replay-box \{[\s\S]*?width: 36px;[\s\S]*?height: 30px;/.test(clean));
check("blue send button is still 36×36 (the alignment reference)",
  /\.app-manual-send \{[\s\S]*?width: 36px;[\s\S]*?height: 36px;/.test(clean));
check("centres coincide by construction: both boxes are 36 wide, both buttons are flex:none, neither has a right margin",
  /\.app-replay \{[\s\S]*?flex: none;/.test(clean) &&
  /\.app-manual-send \{[\s\S]*?flex: none;/.test(clean) &&
  !/\.app-replay \{[^}]*margin-right/.test(clean) &&
  !/\.app-manual-send \{[^}]*margin-right/.test(clean));
check("the 8px gap to the chips is unchanged (the hit area never eats it)",
  /\.app-actions \{[\s\S]*?gap: 8px;/.test(clean));
check("the action row is still 44px tall, so the hero height cannot move",
  /\.app-replay \{[\s\S]*?height: 44px;/.test(clean) &&
  /\.app-actions \{ display: flex; align-items: center;/.test(clean));
check("Replay focus ring still lands on the visible box (it moves with the box)",
  /\.app-replay:focus-visible \.app-replay-box \{ outline: 3px solid var\(--focus\); outline-offset: 2px;/.test(clean));

// 2. Sticky dismiss: same height as the primary button, always a square.
const closeRule = (clean.match(/\.sticky-cta-close \{[\s\S]*?\}/) || [""])[0];
check("sticky dismiss stretches to the bar's content height",
  /align-self: stretch;/.test(closeRule));
check("sticky dismiss stays square via aspect-ratio: 1",
  /aspect-ratio: 1;/.test(closeRule));
check("sticky dismiss has a 44px floor (never below the Step 11 target)",
  /min-width: 44px;/.test(closeRule) && /min-height: 44px;/.test(closeRule));
check("sticky dismiss has no fixed 44px width/height to drift from (a measured 51px would be stale)",
  !/(^|[\s;{])width: 44px;/.test(closeRule) && !/(^|[\s;{])height: 44px;/.test(closeRule));
check("sticky dismiss is still in-flow, 12px radius, surface fill, centred glyph",
  !/position:\s*absolute/.test(closeRule) && /flex: none;/.test(closeRule) &&
  /border-radius: 12px;/.test(closeRule) && /background: var\(--surface-2\);/.test(closeRule) &&
  /display: grid; place-items: center;/.test(closeRule));
check("sticky bar still has a 12px gap between button and dismiss",
  /\.sticky-cta \{[\s\S]*?gap: 12px;/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
