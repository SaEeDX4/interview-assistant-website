/* Step 29 — the 360px mid-play +40px hero bump, root-caused and fixed.
   Run: node tests/test-step29.js
   (from ~/workspace/interview-assistant-website).
   Saeed (2026-11-15 ~15:14 PST): "find it precisely and fix it". The
   bump had appeared in the Step 27 live check (706.81px at 500ms and
   2000ms, start/end 666.81px), not in the Step 28 check, and again in
   the Step 28 fix-up check — intermittent because the samples were
   wall-clock and the play starts on scroll. Live diagnosis at 100ms
   sampling (browser tasks 61f9c212 + 477b1083) PROVED the cause: at
   360px the header content is 294.00px, and the status pill exceeds
   it for three of the eight status words — "Hearing audio" +2.70px,
   "Preparing answer" +21.64px, "Question detected" +25.64px — so
   .app-header (flex-wrap: wrap) dropped the 110.41px controls to a
   second row, header 54px -> 94px, window 666.81px -> 706.81px.
   24/50 samples were wrapped, all on those three words. The Step 23
   shed only guaranteed one row down to a 383.64px viewport (it was
   measured at 390px, where the longest word fits by 4.36px), so
   360px and 375px phones still flipped; at 320px the header was two
   rows on every word (constant, no jump, but not one row).
   Fix (validated in the harness before implementation): below 385px
   the header sheds the 48px level meter — the next chrome shed in
   the real app's own pattern — and tightens its gaps (12px -> 8px,
   8px -> 4px) and the pill/Start horizontal padding (12px -> 8px).
   Hiding the meter alone was NOT enough (at 320px two words still
   wrapped, which would have CREATED a mid-play jump there). With
   the full fix, all eight words stay one row at 320/360/375/382px
   (worst-case margin +18.36px at 320px), a 360px auto-play holds
   666.81px in 51/51 samples, and 390px is untouched. The 384px
   width joins the breakpoint set (BREAKPOINTS.md) — a computed
   threshold, not a device guess. The block sits after the base
   header rules so its same-specificity overrides win by order.
   Step 30 fix-up (2026-11-16): the threshold moved 384px -> 400px.
   Step 30's live verification caught the header wrapping at 390px
   during a real play — the static margin there was only ~4.36px,
   inside font-rendering variance. Same shed rules, wider computed
   threshold; see BREAKPOINTS.md and the STABILITY.md fix-up audit. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "website", "styles.css"), "utf8");
const bp = fs.readFileSync(path.join(root, "standards", "BREAKPOINTS.md"), "utf8");
const stab = fs.readFileSync(path.join(root, "standards", "STABILITY.md"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. The shed block exists and carries all five rules.
const block = (clean.match(/@media \(max-width: 400px\) \{([\s\S]*?)\n\}/) || [])[1] || "";
check("400px media block exists (384px in Step 29, widened by the Step 30 fix-up)", block.length > 0);
check("the meter is shed inside the block",
  /\.app-meter\s*\{\s*display:\s*none;\s*\}/.test(block));
check("header gap tightens to 8px inside the block",
  /\.app-header\s*\{\s*gap:\s*8px;\s*\}/.test(block));
check("controls gap tightens to 4px inside the block",
  /\.app-header-controls\s*\{\s*gap:\s*4px;\s*\}/.test(block));
check("pill horizontal padding tightens to 8px inside the block",
  /\.app-pill\s*\{\s*padding-left:\s*8px;\s*padding-right:\s*8px;\s*\}/.test(block));
check("Start horizontal padding tightens to 8px inside the block",
  /\.app-start\s*\{\s*padding-left:\s*8px;\s*padding-right:\s*8px;\s*\}/.test(block));

// 2. The shed is scoped: the base meter rule is untouched, and the
//    block comes after it (same specificity — order must win).
const baseMeter = (clean.match(/\.app-meter\s*\{([^}]*)\}/) || [])[1] || "";
check("base meter rule still defines the 48px meter, not hidden",
  /width:\s*48px/.test(baseMeter) && !/display:\s*none/.test(baseMeter),
  baseMeter.trim());
check("the meter is hidden exactly once in the whole stylesheet",
  (clean.match(/\.app-meter\s*\{\s*display:\s*none;\s*\}/g) || []).length === 1);
check("the 400px block sits after the base header rules",
  clean.indexOf("@media (max-width: 400px)") > clean.indexOf(".app-badge[hidden]"));

// 3. The Step 23 shed is unchanged.
check("the <=640px shed (icon-only Start + badge off) is intact",
  /@media \(max-width: 640px\) \{[\s\S]*?\.app-start-label \{[^}]*display: none;[\s\S]*?\.app-header \.app-badge \{[^}]*display: none;/.test(clean));

// 4. The standards record the new width and the fix.
check("BREAKPOINTS.md lists 400px in the closed set",
  /\| 400px \|/.test(bp) && /one of 400 \/ 480/.test(bp));
check("STABILITY.md carries the Step 29 audit",
  /## Audit — Step 29/.test(stab) && /383\.64px/.test(stab));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
