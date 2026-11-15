/* Step 25 — one-line action chips + Replay in the row + a more beautiful
   question/answer entrance.
   Run: node tests/test-step25.js
   (from ~/workspace/interview-assistant-website).
   (1) Chips: the five action chips (Shorter … Regenerate) never wrap —
   they live in a horizontally scrollable strip (Material singleLine +
   HorizontalScrollView; Apple HIG: partial content at the edge is the
   scrollability signal) with a 32px fade edge that appears only where
   more content lies, and a peek of the next chip. Compaction was measured
   impossible (509px into 326px at 390px). The pinned control at the row's
   right end (Replay in the hero, history in the story/demo) is a sibling
   of the scroller, never inside it, so it never scrolls away.
   (2) Entrance: the question lands (Material fade-through: 92% → 100%
   scale + 6px rise, 250ms, the one entrance curve) instead of popping in
   whole; each bullet's 7px dot lands first (0.6 → 1 in 150ms); the
   thinking dots crossfade out over 150ms as the first bullet lands
   (the Lottie typing-to-message handoff). Transform/opacity only, so no
   height ever moves. E5 (a highlight sweep on the question) was held back
   — the only fidelity departure — and must stay out.
   (3) Replay: the standalone "↻ Replay" button below the window is gone;
   only the ↻ icon sits at the right end of the hero's action row, and
   the stats strip sits directly under the window. Step 27: the glyph is a
   16px SVG inside a 36×30 visible box, centred in the 44×44 button. */
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

// 1. Three chip rows, each a scroller with exactly the five chips.
const scrollers = html.match(/<div class="app-actions-scroll"[^>]*>([\s\S]*?)<\/div>/g) || [];
check("three chip scrollers exist (hero, story live view, home demo)",
  scrollers.length === 3, `found ${scrollers.length}`);
check("every scroller holds exactly the five chips, in order",
  scrollers.length === 3 && scrollers.every((s) =>
    (s.match(/class="app-chip"/g) || []).length === 5 &&
    /Shorter<\/span><span class="app-chip">Technical<\/span><span class="app-chip">Example<\/span><span class="app-chip">Full answer<\/span><span class="app-chip">Regenerate<\/span>/.test(s)));

// 2. The row never wraps: .app-actions has no flex-wrap, the scroller is
// nowrap and scrolls horizontally with a hidden scrollbar.
check("the action row never wraps (no flex-wrap on .app-actions, nowrap scroller)",
  !/\.app-actions \{[^}]*flex-wrap/.test(clean) &&
  /\.app-actions-scroll \{[^}]*flex-wrap: nowrap;/.test(clean));
check("the scroller shrinks to what the pinned control leaves (flex + min-width: 0)",
  /\.app-actions-scroll \{[^}]*flex: 1 1 auto;[^}]*min-width: 0;/.test(clean));
check("the scroller scrolls horizontally, scrollbar hidden, direction-locked",
  /\.app-actions-scroll \{[^}]*overflow-x: auto;[^}]*overflow-y: hidden;/.test(clean) &&
  /scrollbar-width: none;/.test(clean) &&
  /\.app-actions-scroll::-webkit-scrollbar \{ display: none; \}/.test(clean) &&
  /touch-action: pan-x;/.test(clean));
check("the scroller snaps gently (proximity, never mandatory)",
  /scroll-snap-type: x proximity;/.test(clean) &&
  !/scroll-snap-type: x mandatory;/.test(clean));
check("chips never shrink or clip (flex: none)",
  /\.app-actions-scroll \.app-chip \{[^}]*flex: none;/.test(clean));

// 3. The fade edge: a 32px mask on the side(s) with more content.
check("fade masks exist (right, left, both) with a 32px fade",
  /\.app-actions-scroll\.can-scroll-right \{[^}]*mask-image: linear-gradient\(to right, black 0, black calc\(100% - 32px\), transparent 100%\);/.test(clean) &&
  /\.app-actions-scroll\.can-scroll-left \{[^}]*mask-image: linear-gradient\(to left, black 0, black calc\(100% - 32px\), transparent 100%\);/.test(clean) &&
  /\.app-actions-scroll\.can-scroll-right\.can-scroll-left \{[^}]*mask-image: linear-gradient\(to right, transparent 0, black 32px, black calc\(100% - 32px\), transparent 100%\);/.test(clean));

// 4. The fade JS: toggles the mask classes on scroll + resize, nothing else.
const fadeJs = (js.match(/\/\* Step 25 — chip-row fade edge[\s\S]*?$/) || [""])[0];
check("fade JS toggles can-scroll-right/left from scroll position",
  /function update\(scroller\) \{[\s\S]*?classList\.toggle\("can-scroll-right",[\s\S]*?scrollLeft \+ scroller\.clientWidth < scroller\.scrollWidth - 1\);/.test(fadeJs) &&
  /classList\.toggle\("can-scroll-left", scroller\.scrollLeft > 0\);/.test(fadeJs));
check("fade JS listens to scroll (passive) and resize, and runs once at load",
  /addEventListener\("scroll", function \(\) \{ update\(scroller\); \}, \{ passive: true \}\);/.test(fadeJs) &&
  /window\.addEventListener\("resize", updateAll\);/.test(fadeJs) &&
  /update\(scroller\);[\s\S]*?\}\);[\s\S]*?window\.addEventListener\("resize"/.test(fadeJs));

// 5. The pinned control is a sibling of the scroller, never inside it.
check("Replay is a sibling of the hero's scroller (pinned, never scrolls away)",
  /<\/div>\s*<button type="button" class="app-replay is-hidden" id="hero-replay" aria-label="Replay the animated preview"><span class="app-replay-box">/.test(html));
check("Replay is icon-only (SVG, no \"Replay\" text), button 44px, visible box 36x30 (Step 27)",
  !/>↻ Replay</.test(html) && !/id="hero-replay"[^>]*>↻</.test(html) &&
  /\.app-replay \{[\s\S]*?width: 44px;[\s\S]*?height: 44px;/.test(clean) &&
  /\.app-replay-box \{[\s\S]*?width: 36px;[\s\S]*?height: 30px;/.test(clean));
check("the story/demo history is a sibling of its scroller (pinned)",
  /<\/div>\s*<span class="app-history" id="story-history" hidden/.test(html) &&
  /<\/div>\s*<span class="app-history"><span>‹<\/span><span>2 \/ 2<\/span><span>›<\/span><\/span>/.test(html));
check("no standalone Replay below the window (no .hero-replay anywhere)",
  !/hero-replay/.test(clean) && !/class="hero-replay"/.test(html));

// 6. The stats strip sits directly under the window (no button between).
check("stats strip directly follows the hero window (nothing between)",
  /<\/div>\s*<\/div>\s*<dl class="hero-stats">/.test(html));

// 7. Entrance E1: the question lands (fade + 6px rise + 0.92 scale, 250ms).
check("land keyframe exists (opacity 0→1, translateY 6px, scale .92→1)",
  /@keyframes land \{ from \{ opacity: 0; transform: translateY\(6px\) scale\(\.92\); \} to \{ opacity: 1; transform: none; \} \}/.test(clean));
check("the question uses land (250ms, the one entrance curve)",
  /\.app-question\.is-landing \{ animation: land \.25s cubic-bezier\(\.2,\.7,\.3,1\) both; \}/.test(clean));
check("hero lands the question when it is set (play + reduced-motion render)",
  (js.match(/landQuestion\(\);/g) || []).length >= 2 &&
  /function landQuestion\(\) \{[\s\S]*?classList\.remove\("is-landing"\);[\s\S]*?classList\.add\("is-landing"\);/.test(js) &&
  /questionEl\.addEventListener\("animationend", function \(\) \{[\s\S]*?classList\.remove\("is-landing"\);/.test(js));
check("story lands the question layer on every beat (setQuestionLayer + buildLayers listener)",
  /function setQuestionLayer\(i\) \{[\s\S]*?showLayer\(questionLayers, i\);[\s\S]*?layer\.classList\.add\("is-landing"\);/.test(js) &&
  /p\.addEventListener\("animationend", function \(\) \{ p\.classList\.remove\("is-landing"\); \}\);/.test(js));

// 8. Entrance E3: the bullet's dot lands first (0.6 → 1 in 150ms).
check("dot-land keyframe exists (scale .6 → 1)",
  /@keyframes dot-land \{ from \{ transform: scale\(\.6\); \} to \{ transform: scale\(1\); \} \}/.test(clean));
check("the dot lands on new bullets (hero/story + demo)",
  /\.app-answer li\.is-new \.app-dot,[\s\S]*?\.demo-answer li\.is-new \.app-dot \{ animation: dot-land \.15s cubic-bezier\(\.2,\.7,\.3,1\) both; \}/.test(clean));

// 9. Entrance E2: the thinking dots crossfade out (150ms) as the first
// bullet lands, instead of vanishing instantly.
check("the thinking row crossfades (150ms opacity transition, standard curve)",
  /\.app-thinking \{[^}]*transition: opacity \.15s cubic-bezier\(\.2,\.7,\.3,1\);/.test(clean));
check("hero + story fade the dots (opacity 0, 150ms timer, then is-hidden + reset)",
  (js.match(/function fadeThinking\(\) \{[\s\S]*?thinkingEl\.style\.opacity = "0";[\s\S]*?setTimeout\(function \(\) \{[\s\S]*?thinkingEl\.classList\.add\("is-hidden"\);[\s\S]*?thinkingEl\.style\.opacity = "";\s*\}, 150\)\);/g) || []).length === 2);
check("the fade is used where the first bullet lands (hero + story)",
  (js.match(/fadeThinking\(\);/g) || []).length >= 2);
check("the thinking opacity is reset wherever the row is hidden or shown",
  (js.match(/thinkingEl\.style\.opacity = "";/g) || []).length >= 4);

// 10. E5 stays out: no highlight sweep on the question, no background
// animation, no blur, no typing.
check("no highlight sweep on the question (E5 held back — the fidelity departure)",
  !/app-question::after/.test(clean) &&
  !/question.*background.*animation/.test(clean) &&
  !/\.app-question \{[^}]*background/.test(clean));
check("no blur in the entrance (the one entrance curve is enforced by test-step14; the site's backdrop-filter frosted glass and glow blob are not motion)",
  !/@keyframes (land|dot-land|rise) \{[^}]*blur/.test(clean) &&
  !/TYPE_MS|QUESTION\.slice\(0, typed\)/.test(js));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
