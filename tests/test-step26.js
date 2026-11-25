/* Step 26 — the Step 25 chips row clipped the mobile hero.
   Run: node tests/test-step26.js
   (from ~/workspace/interview-assistant-website).
   Step 25's nowrap chips row raised the app window's min-content to 531px
   (chips 445 + Replay 44 + gap 8 = 497, + 32 body padding + 2 border).
   The hero grid at <=1024px was grid-template-columns: 1fr, i.e.
   minmax(auto, 1fr), so the single column followed that 531px min-content
   and .hero's overflow: hidden clipped Start, the Replay icon and the
   third stats column off the right edge at 390/420/320px. The page never
   scrolled horizontally, so scrollWidth == innerWidth still passed and
   hid the clipping; the fade/scroll never engaged either, because the
   scroller was 445px wide — exactly its content — so scrollWidth ==
   clientWidth and the JS never added the mask classes.
   Fix, same pattern as Step 22's story fix: the 1024px track becomes
   minmax(0, 1fr) and .hero-visual gets min-width: 0, so the track shrinks
   to its container and the chips row finally scrolls inside the window.
   Desktop is untouched: its tracks are wide enough for 531px already. */
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

// The <=1024px block: the first @media (max-width: 1024px) block holds the
// hero rules (the second holds the nav). Pull it out to test inside it.
const m1024 = clean.match(/@media \(max-width: 1024px\) \{([\s\S]*?)\n\}/);
check("a <=1024px media block exists", !!m1024);
const block = m1024 ? m1024[1] : "";

// 1. The hero track no longer follows the window's min-content.
check("hero track at <=1024px is minmax(0, 1fr), not bare 1fr",
  /\.hero-grid \{ grid-template-columns: minmax\(0, 1fr\); gap: 32px; \}/.test(block) &&
  !/\.hero-grid \{ grid-template-columns: 1fr;/.test(block));

// 2. The visual (the grid item holding the window) may shrink to the track.
check(".hero-visual gets min-width: 0 at <=1024px",
  /\.hero-visual \{ min-width: 0; \}/.test(block));

// 3. Desktop is untouched: the two-column hero keeps its 1.02fr / .98fr.
check("desktop hero grid untouched (1.02fr .98fr, 56px gap)",
  /\.hero-grid \{ display: grid; grid-template-columns: 1\.02fr \.98fr; gap: 56px; align-items: center; \}/.test(clean));

// 4. The base .hero-visual rule is untouched (still positioned for the glow).
check("base .hero-visual rule untouched (position: relative)",
  /\.hero-visual \{ position: relative; \}/.test(clean));

// 5. The mechanism the fix relies on is still there: the chips scroller
// shrinks to what the pinned Replay leaves, so it scrolls instead of
// widening the window (Step 25's rule, re-asserted here).
check("chips scroller still shrinks (flex: 1 1 auto; min-width: 0)",
  /\.app-actions-scroll \{[^}]*flex: 1 1 auto;[^}]*min-width: 0;/.test(clean));
check("chips row still nowrap and horizontally scrollable",
  /\.app-actions-scroll \{[^}]*flex-wrap: nowrap;[^}]*overflow-x: auto;/.test(clean));

// 6. The stats strip still has all three columns in one row — the third
// column (30-min free trial) is what was clipped, so it must still exist
// as a column, not wrapped or hidden.
check("stats strip still three equal columns in one row",
  /\.hero-stats \{[^}]*display: grid; grid-template-columns: repeat\(3, 1fr\);/.test(clean) &&
  /<dl class="hero-stats">[\s\S]*?<dd>50–150<\/dd>[\s\S]*?<dd>10<\/dd>[\s\S]*?<dd>30-min<\/dd>/.test(html));

// 7. .hero keeps overflow: hidden (the glow + section clip guard stays);
// the fix makes the content fit inside it instead of removing the guard.
check(".hero still clips overflow (guard stays; content now fits)",
  /\.hero \{[^}]*overflow: hidden;/.test(clean));

// 8. No new breakpoint: the fix lives in the existing 1024px block —
// there were four 1024px blocks before this step (hero, nav, + two
// later ones) and there are still four.
/* Step 93 re-pin: the count is five, not four — the Terms page's
   contents-bar mode is a fifth component block at the same admitted
   1024px width (no new width enters the set; BREAKPOINTS.md's table
   and audit log record the correction). */
check("no new breakpoint added (1024px blocks: five since Step 93)",
  (clean.match(/@media \(max-width: 1024px\) \{/g) || []).length === 5);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
