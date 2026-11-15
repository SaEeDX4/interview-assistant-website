/* Step 22 — mobile story player + overflow fix. Run: node tests/test-step22.js
   (from ~/workspace/interview-assistant-website).
   The Step 21 stacked snapshots widened the page to 451px at a 390px viewport
   (61px of horizontal scroll, measured live): the 1fr grid track's auto
   minimum was beat 3's header min-content (436px). Step 22 fixes the grid,
   lets the app header wrap, and replaces the seven stacked snapshots on
   mobile with one swipeable player (segments + one window + caption). */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

// 1. Grid fix: the 1fr track is minmax(auto, 1fr) — its auto minimum is the
// widest snapshot's min-content. minmax(0, 1fr) + min-width: 0 let it shrink.
check("<=860px grid track is minmax(0, 1fr), not 1fr",
  /@media \(max-width: 860px\) \{[\s\S]*?\.story-layout \{[^}]*grid-template-columns: minmax\(0, 1fr\);/.test(clean)
  && !/\.story-layout \{[^}]*grid-template-columns: 1fr;/.test(clean));
check("story steps list has min-width: 0",
  /\.story-steps \{\s*min-width: 0;\s*\}/.test(clean));

// 2. The app header wraps on narrow windows instead of clipping, and its
// [hidden] state works: showView() hides the live header on the Home beat,
// but .app-header { display: flex } overrode the UA [hidden] rule, so the
// Home view showed BOTH headers (found in live verification, Step 22).
check("app header wraps (flex-wrap) at <=860px",
  /@media \(max-width: 860px\) \{[\s\S]*?\.app-header \{\s*flex-wrap: wrap;\s*\}/.test(clean));
check("app header [hidden] hides it (no double header on the Home beat)",
  /\.app-header\[hidden\] \{\s*display: none;\s*\}/.test(clean));

// 3. Player chrome exists: seven labelled segments, caption, nav.
const segs = [...html.matchAll(/<button type="button" class="story-seg[^"]*" data-beat="(\d)"[^>]*>([^<]+)<\/button>/g)];
check("seven labelled segments in order (Prep Start Q1 Adapt Coach Q2 Report)",
  segs.map((m) => m[1]).join(",") === "0,1,2,3,4,5,6"
  && segs.map((m) => m[2]).join(" ") === "Prep Start Q1 Adapt Coach Q2 Report");
check("shortened segment labels keep their full names as aria-labels",
  /data-beat="0" aria-current="true" aria-label="Prepare">Prep</.test(html)
  && /data-beat="3" aria-label="Concise">Adapt</.test(html));
check("caption has title + text ids, starts at beat 0",
  /<h3 id="story-caption-title">Before the interview — Prepare<\/h3>/.test(html)
  && /<p id="story-caption-text">In Home, four steps/.test(html));
check("nav has prev/next buttons + counter 1 / 7, prev disabled",
  /<button type="button" class="story-prev" aria-label="Previous beat" disabled>‹<\/button>/.test(html)
  && /<button type="button" class="story-next" aria-label="Next beat">›<\/button>/.test(html)
  && /<span class="story-count" id="story-count">1 \/ 7<\/span>/.test(html));

// 4. Player chrome is hidden by default; html.story-player shows it.
check("player chrome hidden by default",
  /\.story-segments, \.story-caption, \.story-nav \{\s*display: none;\s*\}/.test(clean));
check("html.story-player shows the window (static, not sticky) and hides the steps",
  /html\.story-player \.story-window \{\s*display: block; position: static; touch-action: pan-y;\s*\}/.test(clean)
  && /html\.story-player \.story-steps \{\s*display: none;\s*\}/.test(clean));
check("html.story-player shows segments, caption, nav",
  /html\.story-player \.story-segments \{\s*display: flex; gap: 4px;\s*\}/.test(clean)
  && /html\.story-player \.story-caption \{\s*display: block;\s*\}/.test(clean)
  && /html\.story-player \.story-nav \{\s*display: flex; align-items: center; justify-content: space-between;\s*\}/.test(clean));
check("player header sheds decorative buttons (? … minimise maximise)",
  /html\.story-player \.app-header \.app-icon-btn,[\s\S]*?html\.story-player \.app-header \.app-win-btn:not\(:last-child\) \{\s*display: none;\s*\}/.test(clean));

// 5. Player targets are 44px (accessibility) and on the type/spacing scales.
check("segments are 44px targets, 11px labels",
  /\.story-seg \{[^}]*min-height: 44px;[^}]*font-size: 11px;/.test(clean));
check("nav buttons are 44x44",
  /\.story-prev, \.story-next \{[^}]*width: 44px; height: 44px;/.test(clean));

// 6. Mode comes from the CSS, not a width in JS (Step 15): the snapshot probe.
check("narrow mode read from the snapshot probe (no width literal in JS)",
  /var snapProbe = document\.querySelector\("\.story-snap"\);/.test(js)
  && /function isNarrow\(\) \{\s*return !!snapProbe && getComputedStyle\(snapProbe\)\.display !== "none";\s*\}/.test(js)
  && /window\.addEventListener\("resize", applyMode\);/.test(js));

// 7. Player behaviour: class toggle, tap, swipe, keys, caption mirror.
check("player toggles html.story-player and drives the same window",
  /document\.documentElement\.classList\.add\("story-player"\);/.test(js)
  && /document\.documentElement\.classList\.remove\("story-player"\);/.test(js)
  && /setupPlayer\(\);\s*activate\(currentBeat\);/.test(js));
check("swipe: horizontal past 40px changes the beat (touch-action pan-y in CSS)",
  /storyWindow\.addEventListener\("touchstart"/.test(js)
  && /storyWindow\.addEventListener\("touchend"/.test(js)
  && /if \(Math\.abs\(dx\) > 40\) \{ goBeat\(currentBeat \+ \(dx < 0 \? 1 : -1\)\); \}/.test(js));
check("segments, arrows and arrow keys drive goBeat",
  /segBtns\.forEach\(function \(btn, i\) \{\s*btn\.addEventListener\("click", function \(\) \{ goBeat\(i\); \}\);/.test(js)
  && /prevBtn\.addEventListener\("click", function \(\) \{ goBeat\(currentBeat - 1\); \}\);/.test(js)
  && /nextBtn\.addEventListener\("click", function \(\) \{ goBeat\(currentBeat \+ 1\); \}\);/.test(js)
  && /if \(e\.key === "ArrowLeft"\) \{ goBeat\(currentBeat - 1\); \}/.test(js)
  && /if \(e\.key === "ArrowRight"\) \{ goBeat\(currentBeat \+ 1\); \}/.test(js));
check("player UI mirrors the beat: segments, caption, counter, arrow state",
  /btn\.classList\.toggle\("is-active", i === beat\);/.test(js)
  && /btn\.setAttribute\("aria-current", "true"\);/.test(js)
  && /captionTitle\.textContent = h3\.textContent;/.test(js)
  && /countEl\.textContent = \(beat \+ 1\) \+ " \/ " \+ steps\.length;/.test(js)
  && /prevBtn\.disabled = beat === 0;/.test(js)
  && /nextBtn\.disabled = beat === steps\.length - 1;/.test(js)
  && /if \(playerOn\) \{ setPlayerUI\(beat\); \}/.test(js));
check("reduced motion: finals render at once, no timers (player works too)",
  /if \(reduced\) \{ finals\[beat\]\(\); \}/.test(js));

// 8. No-JS fallback intact: seven snapshots still in the HTML.
check("no-JS fallback: seven snapshots still present",
  (html.match(/class="story-snap"/g) || []).length === 7);

// 9. Lede is mode-neutral (no "Scroll through" — mobile swipes, desktop scrolls).
check("story lede does not say Scroll through",
  !/Scroll through a whole interview/.test(html)
  && /Follow a whole interview in the real app window/.test(html));

// 10. The DOM-shim simulation for the player exists and is runnable.
check("sim-step22.js exists (desktop / mobile / reduced runs)",
  fs.existsSync(path.join(__dirname, "sim-step22.js")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
