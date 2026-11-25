/* Step 23 — fixed stage (layout stability). Run: node tests/test-step23.js
   (from ~/workspace/interview-assistant-website).
   Saeed's report: the story player's arrows + counter jump on every beat
   (the window is 338–694px tall depending on the beat) and the hero box
   grows as the answer streams in, pushing everything below it down. The
   standard (STABILITY.md): every animated window is a grid-stack stage —
   all states pre-rendered as layers in one cell, hidden with visibility
   (never display), revealed with opacity/transform only — so the stage is
   always as tall as its tallest state and nothing below it ever moves.
   The demo page has the same streaming pattern; it is fixed the same way
   once its tallest sample is measured (separate browser check). */
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
const heroJs = (js.split("Step 21 — hero")[1] || "").split("Steps 21–22 — scroll story")[0];
const storyJs = (js.split("Steps 21–22 — scroll story")[1] || "").split("Step 1 — scroll reveal")[0];

// 1. The mechanism: .is-hidden is visibility, never display.
// (Step 24 exception: in player mode ONLY, the inactive story VIEWS +
// HEADERS are display:none — html.story-player .story-window ... >
// .is-hidden — so the window glides to the active view's height. That
// rule is scoped to the player and asserted in test-step24; nothing
// else hides .is-hidden with display.)
check("is-hidden is visibility:hidden (layers keep their space)",
  /\.is-hidden \{\s*visibility: hidden;\s*\}/.test(clean) &&
  !/(^|\n)\.is-hidden \{\s*display: none/.test(clean));

// 2. Header stack: the two headers share one grid cell.
check("headers are a grid stack (home bar + live header in one cell)",
  /\.app-header-stack \{\s*display: grid;\s*\}/.test(clean) &&
  /\.app-header-stack > \* \{\s*grid-area: 1 \/ 1;\s*\}/.test(clean) &&
  /<div class="app-header-stack">[\s\S]*?id="story-home-header"[\s\S]*?id="story-live-header"[\s\S]*?<\/div>\s*<div class="app-window-body"/.test(html) &&
  /homeHeader\.classList\.toggle\("is-hidden", name !== "home"\);/.test(js) &&
  /liveHeader\.classList\.toggle\("is-hidden", name === "home"\);/.test(js));

// 3. Body stack: the three views share one grid cell.
check("story window body is a grid stack (Home / Live / Report in one cell)",
  /\.story-window \.app-window-body \{\s*display: grid;\s*\}/.test(clean) &&
  /\.story-window \.app-window-body > \* \{\s*grid-area: 1 \/ 1;\s*\}/.test(clean) &&
  /homeView\.classList\.toggle\("is-hidden", name !== "home"\);/.test(js) &&
  /liveView\.classList\.toggle\("is-hidden", name !== "live"\);/.test(js) &&
  /reportView\.classList\.toggle\("is-hidden", name !== "report"\);/.test(js));

// 4. Question + answer stacks: five layers each, built once from the data.
check("question + answer stacks exist (containers + layer builders)",
  /<div class="app-question-stack" id="story-question-stack"><\/div>/.test(html) &&
  /<div class="app-answer-stack" id="story-answer-stack">/.test(html) &&
  /\.app-question-stack \{\s*display: grid;\s*\}/.test(clean) &&
  /\.app-answer-stack \{\s*display: grid;\s*\}/.test(clean) &&
  /var QUESTION_TEXTS = \[READY_TEXT,/.test(js) &&
  /var ANSWER_POINTS = \[\[\], Q1_POINTS, Q3_POINTS, null, Q2_POINTS\];/.test(js) &&
  /function buildLayers\(\) \{/.test(js) &&
  /function showLayer\(layers, i\) \{/.test(js) &&
  /function setQuestionLayer\(i\) \{[\s\S]*?showLayer\(questionLayers, i\);[\s\S]*?classList\.add\("is-landing"\);/.test(js) &&
  // Step 83 re-pin (annotated): setAnswerLayer also syncs the answer
  // card's label (layer 3 is Coach -> "Coach", as the app's LAnswer
  // does); the layer-switch itself is unchanged.
  /function setAnswerLayer\(i\) \{\s*showLayer\(answerLayers, i\);/.test(js) &&
  /answerLabelEl\.textContent = i === 3 \? "Coach" : "Answer";/.test(js));
check("coach is answer layer 3 (its markup sits in the stack)",
  /id="story-answer-stack">[\s\S]*?id="story-coach"/.test(html) &&
  /setAnswerLayer\(3\)/.test(js));

// 5. Caption stack + live region: seven layers from the steps, announced.
check("caption is a stack of seven layers + a visually-hidden live region",
  /<div class="story-caption-stack" id="story-caption-stack"><\/div>/.test(html) &&
  /<p class="visually-hidden" id="story-caption-live" aria-live="polite"><\/p>/.test(html) &&
  /\.story-caption-stack \{\s*display: grid;\s*\}/.test(clean) &&
  /\.visually-hidden[^{]*\{[\s\S]*?position: absolute;[\s\S]*?clip: rect\(0, 0, 0, 0\);/.test(clean) &&
  /showLayer\(captionItems, beat\);/.test(js) &&
  /captionLive\.textContent = caption\.title/.test(js));

// 6. Hero bullets are built once at load, hidden; plays only toggle classes.
check("hero layers pre-rendered hidden at load; play() never rebuilds (Step 30: layers)",
  /function buildLayers\(\) \{/.test(heroJs) &&
  /buildLayers\(\);\s*setGhosts\(sample\.rtl \? "rtl" : "ltr", sample\.lang \|\| "en"\);\s*if \(reduced\)/.test(heroJs) &&
  /function makeLayer\(bullets, rtl, lang\) \{[\s\S]*?li\.classList\.add\("is-hidden"\);[\s\S]*?ul\.classList\.add\("is-hidden"\);/.test(heroJs) &&
  !/appendChild|buildLayers/.test((heroJs.split("function play() {")[1] || "").split("function pause()")[0]) &&
  /function setLayerBullets\(ul, hidden\) \{/.test(heroJs));
check("hero thinking + Replay use visibility (their space is reserved)",
  /thinkingEl\.classList\.(add|remove)\("is-hidden"\)/.test(heroJs) &&
  /replayBtn\.classList\.(add|remove)\("is-hidden"\)/.test(heroJs) &&
  !/(thinkingEl|replayBtn)\.hidden\s*=/.test(heroJs));

// 7. Transcript line is reserved (one line), so typing never grows the card.
check("transcript reserves one line (min-height 1.5em)",
  /\.app-transcript \{[^}]*min-height: 1\.5em;/.test(clean));

// 8. Header is one row on every beat at <=640px: icon-only Start + no badge
// (the real app sheds the start label below 580px and the badge below 640px).
check("Start button splits icon + label (label hidden at <=640px)",
  /<span class="app-start-label" id="mock-start-label">Start listening<\/span>/.test(html) &&
  /<span class="app-start-label" id="story-start-label">Start listening<\/span>/.test(html) &&
  /setStart\("Pause"\)/.test(heroJs) &&
  /setStart\("Pause"\)/.test(storyJs) &&
  /@media \(max-width: 640px\) \{[\s\S]*?\.app-start-label \{[^}]*display: none;[\s\S]*?\.app-header \.app-badge \{[^}]*display: none;/.test(clean));
// Step 24: the badge rule is .app-header .app-badge (0,2,0) — the bare
// .app-badge selector lost to the later base rule (display: inline-flex)
// and the badge showed on the Adapt beat at 390px (+40px, caught live).
check("no .hidden toggles on the converted elements (visibility only)",
  !/(thinkingEl|openLive|contextEl|coachEl|homeHeader|liveHeader|homeView|liveView|reportView)\.hidden\s*=/.test(js) &&
  /contextEl\.classList\.(add|remove)\("is-hidden"\)/.test(js) &&
  /openLive\.classList\.(add|remove)\("is-hidden"\)/.test(js));

// 9. Appends happen only in the builders (init), never during a beat:
// buildLayers builds the 7 layers (7 appends), makeBullet builds a bullet
// (2 appends) — both run at load only. No append anywhere else in the
// story IIFE, so a beat switch is a visibility toggle, not a rebuild.
check("story appends happen only in buildLayers + makeBullet (never during a beat)",
  (() => {
    const build = (storyJs.split("function buildLayers()")[1] || "").split("function showView")[0];
    const bullet = (storyJs.split("function makeBullet")[1] || "").split("function buildLayers")[0];
    const rest = storyJs.replace(build, "").replace(bullet, "");
    return (build.match(/appendChild/g) || []).length === 7
      && (bullet.match(/appendChild/g) || []).length === 2
      && !/appendChild/.test(rest);
  })());

// 10. Demo: the same fixed stage, on both pages (index.html + demo.html).
// The window is always as tall as its tallest sample (measured 1860.9px
// at 390px for "A conflict with a coworker", 1559.9px for the Arabic
// sample — a 301px range the old streaming code rode up and down).
const demoHtml = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const demoJs = js.split("Step 21 — hero")[0];
check("demo stacks exist on both pages (question + answer; int on demo.html)",
  /<div class="demo-question-stack" id="demo-question-stack">/.test(html) &&
  /<div class="demo-answer-stack" id="demo-answer-stack">/.test(html) &&
  /<div class="demo-question-stack" id="demo-question-stack">/.test(demoHtml) &&
  /<div class="demo-answer-stack" id="demo-answer-stack">/.test(demoHtml) &&
  /<div class="demo-answer-stack" id="int-answer-stack">/.test(demoHtml) &&
  /\.demo-question-stack \{\s*display: grid;\s*\}/.test(clean) &&
  /\.demo-answer-stack \{\s*display: grid;\s*\}/.test(clean));
check("demo layers built once (10 samples x 2 modes + 2 fallback = 22 answer layers)",
  /var SAMPLE_KEYS = \["tell", "hire", "weakness", "story", "five", "fa", "ar", "salary", "conflict", "why"\];/.test(demoJs) &&
  /function buildDemoLayers\(\) \{/.test(demoJs) &&
  /showLayer\(answerLayers, idx \* 2 \+ \(mode === "coach" \? 1 : 0\)\);/.test(demoJs) &&
  /function buildAnswerLayer\(items, rtl, lang\) \{/.test(demoJs) &&
  /function buildCoachLayer\(coach, rtl, lang\) \{/.test(demoJs) &&
  /* Step 85 re-pin: revealRows (the uniform 400ms metronome) is
     retired — the layers are composed by composeRows, in the
     product's two tenses (dots in point 1's row, pending, landed).
     Step 87 re-pin: the two tenses are retired in turn — the
     layers are generated by streamRows (word stream; dots in
     point 1's row until its first words land).
     Bucket-A fix run re-pin (annotated): streamRows gains a sixth
     parameter, onFirstWord — the A5 hook that lets the status
     stop saying "Preparing…" the moment the first word lands. */
  /function streamRows\(layer, tempo, schedule, done, dotsAlready, onFirstWord\) \{/.test(demoJs));
check("demo never empties or inserts during a play (no innerHTML, no skeletons)",
  !/function renderBullets\(|function renderCoach\(/.test(demoJs) &&
  !/answerEl\.innerHTML|intAnswer\.innerHTML/.test(demoJs) &&
  !/className = "skel"|li\.skel/.test(demoJs) &&
  !/\.skel/.test(clean) && !/shimmer/.test(clean));
check("demo tag reserves its slot (visibility); next-step card zero-height while gated (Step 78 re-pin)",
  /sampleTagEl\.classList\.remove\("is-hidden"\)/.test(demoJs) &&
  /sampleTagEl\.classList\.add\("is-hidden"\)/.test(demoJs) &&
  /nextEl\.classList\.remove\("is-hidden"\)/.test(demoJs) &&
  /nextEl\.classList\.add\("is-hidden"\)/.test(demoJs) &&
  !/\.demo-next\[hidden\]/.test(clean) &&
  /* Step 78: the Step 23 reservation made the gated card hold 552px
     of invisible page flow on the owner's phone (403x928) — a full
     dead screen between the help block and the interrupt card. The
     card is page flow, not a stage layer, so hidden now means zero
     height; the window's own tag keeps the Step 23 slot rule. */
  /\.demo-next\.is-hidden \{ display: none; \}/.test(clean));
check("interruption simulator stacks its 3 lengths (Normal / Concise / Rapid)",
  /intLayers\.push\(intAnswer\);/.test(demoJs) &&
  /\["concise", "rapid"\]\.forEach\(function \(key\) \{/.test(demoJs) &&
  /showLayer\(intLayers, \["normal", "concise", "rapid"\]\.indexOf\(key\)\);/.test(demoJs));

// 11. The standard is written down.
check("standards/STABILITY.md exists and names the grid-stack rule",
  fs.existsSync(path.join(__dirname, "..", "standards", "STABILITY.md")) &&
  /grid-stack|grid stack/i.test(fs.readFileSync(path.join(__dirname, "..", "standards", "STABILITY.md"), "utf8")));

// 12. The DOM-shim simulation for the demo exists and is runnable.
check("sim-step23-demo.js exists (animated / reduced runs)",
  fs.existsSync(path.join(__dirname, "sim-step23-demo.js")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
