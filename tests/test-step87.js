/* Step 87 — the generation stream + the owner's five phone
   defects. Run: node tests/test-step87.js (from
   ~/workspace/interview-assistant-website).
   The contracts pinned here:
   - the two tenses are GONE from the demo: no pending (.45)
     resting state, no pending->landed two-step, no rise landing
     on demo points, no PENDING_* constants, no composeRows /
     pendingMs / composePlan / composeDurationMs in the demo
     module. The home hero keeps its own grammar untouched.
   - answers GENERATE: streamRows splits each row's text into
     word spans (.sw) that start display:none and are revealed
     one by one; a revealed word is final — the only animation
     is a <=150ms materialize fade (sw-in), never a resting dim
     state, never a transform. Unrevealed words occupy no layout
     (true inline append: placed words never move).
   - the pacing shape: per-row stream targets keep Step 85's
     length-proportional shape (240 + 3.0/char, 300/720 full;
     x0.6, 180/450 compressed), spent word by word at an
     interval clamped to [18, 55]ms; Coach reform streams at
     26ms/word with a 90ms line gap. Evaluated below, not
     eyeballed.
   - the dots keep their Step 85 seat (point 1's own row) and
     their Step 86 budget: streamRows fades them as the first
     row starts streaming; THINK_MS stays 400.
   - interruption snaps: snapLayerLanded and hideRows flatten
     the word spans back to plain text and rest every row —
     no half-streamed residue survives.
   - the ambush lands ONCE (owner phone evidence, p5): the
     scene builds no concise layer at all; the follow-up beat
     generates sceneA.rapid directly under the single status
     "The follow-up came fast — the answer shortened itself.";
     the old second status ("Faster still…") is deleted.
   - the hollow ANSWER card (same evidence): the reservation
     lives on the card (min-height), the stacks hug content,
     and the question compensation keeps the window's outer
     geometry identical across question lengths — for scene
     AND classic. The QUESTION card hugs too (owner decision):
     its stack height is the active layer's own height.
   - the participant tile never touches the window (owner
     evidence, unfolded): in the <=933 band the window narrows
     symmetrically (min(432px, 100% - 264px)) so the tile's
     frame and label keep on-scale clearances; the phone rule
     restates width:auto so the cap never reaches 403.
   - the name chip hugs its content at phone width
     (fit-content, centred, balanced wrap) — owner crop.
   - the speaking indicator is the owner's approved redesign
     (owner evidence + avatar-expand-affordance research): the
     teal bars are DELETED; her frame carries a halo breathing
     on a smoothed REAL envelope (AnalyserNode RMS; staged
     where no analyser exists) and each name chip carries a
     3-dot meter on the same scalar; camera-off renders NO
     indicator anywhere; the Spotlight PiP gets border only.
   - the expand affordance is the Lean-In (same research): the
     corner glyph is DELETED; a one-time lean + sonar ring +
     bare whisper teaches the tap after Start/Watch, retiring
     permanently on first use or after two showings
     (localStorage), with --motion-pulse (900ms) recorded as a
     scoped exception in standards/MOTION.md. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const demoJs = js.split("Step 21 — hero")[0];
function sliceFn(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  if (a === -1) { return ""; }
  const b = src.indexOf(endMarker, a + startMarker.length);
  return src.slice(a, b === -1 ? undefined : b);
}

/* 1. The two tenses are gone from the demo (hero untouched). */
check("no pending tense in the demo's CSS or scheduler",
  !/\.demo-answer li\.is-pending/.test(clean)
  && !/\.demo-answer li\.is-new \{/.test(clean)
  && !/PENDING_/.test(demoJs)
  && !/function composeRows\(|function pendingMs\(|function composePlan\(|function composeDurationMs\(/.test(demoJs));
check("the hero keeps its own pending grammar (separate module, untouched)",
  /\.app-answer li\.is-pending \{ opacity: \.45; \}/.test(clean));

/* 2. The stream mechanics. */
check("streamRows splits rows into word spans and reveals them in order",
  /function splitWords\(li\)/.test(demoJs) && /function flattenWords\(li\)/.test(demoJs)
  && sliceFn(demoJs, "function streamRows(", "\n  function finishRender(").includes("splitWords(li)")
  && sliceFn(demoJs, "function streamRows(", "\n  function finishRender(").includes('classList.add("is-in")'));
check("unrevealed words occupy no layout; the materialize fade is <=150ms and opacity-only",
  /\.demo-answer \.sw\.is-hidden \{ display: none; \}/.test(clean)
  && /@keyframes sw-in \{ from \{ opacity: 0; \} to \{ opacity: 1; \} \}/.test(clean)
  && /\.demo-answer \.sw\.is-in \{ animation: sw-in \.12s ease-out both; \}/.test(clean));
check("no transform ever animates a demo answer word or point",
  !/\.demo-answer[^{]*\{[^}]*animation:[^}]*rise/.test(clean)
  && !/\.demo-answer \.sw[^{]*\{[^}]*transform/.test(clean));

/* 3. The pacing shape, evaluated. */
const consts = {};
["STREAM_BASE", "STREAM_PER_CHAR", "STREAM_MIN", "STREAM_MAX", "COMPRESSED_FACTOR", "COMPRESSED_MIN", "COMPRESSED_MAX", "WORD_MS_MIN", "WORD_MS_MAX", "REFORM_WORD_MS", "REFORM_GAP_MS", "THINK_MS"]
  .forEach(function (name) {
    const mm = demoJs.match(new RegExp("(?:var |, )" + name + " = ([0-9.]+)[;,]"));
    consts[name] = mm ? parseFloat(mm[1]) : NaN;
  });
check("the stream constants are the spec's (240+3.0 / 300-720 / x0.6 180-450 / words 18-55 / reform 26+90 / think 400)",
  consts.STREAM_BASE === 240 && consts.STREAM_PER_CHAR === 3.0
  && consts.STREAM_MIN === 300 && consts.STREAM_MAX === 720
  && consts.COMPRESSED_FACTOR === 0.6 && consts.COMPRESSED_MIN === 180 && consts.COMPRESSED_MAX === 450
  && consts.WORD_MS_MIN === 18 && consts.WORD_MS_MAX === 55
  && consts.REFORM_WORD_MS === 26 && consts.REFORM_GAP_MS === 90 && consts.THINK_MS === 400);
const timingFn = new Function("STREAM_BASE", "STREAM_PER_CHAR", "STREAM_MIN", "STREAM_MAX", "COMPRESSED_FACTOR", "COMPRESSED_MIN", "COMPRESSED_MAX", "WORD_MS_MIN", "WORD_MS_MAX", "REFORM_WORD_MS", "REFORM_GAP_MS", "THINK_MS",
  /* The harness feeds streamPlan a fake layer whose "rows" are
     the texts themselves (rowText is stubbed to identity). */
  "function rowText(li) { return li; }\n"
  + sliceFn(demoJs, "function wordCount(", "function streamRowTiming(")
  + sliceFn(demoJs, "function streamRowTiming(", "function streamPlan(")
  + sliceFn(demoJs, "function streamPlan(", "function streamRows(")
  + "\nreturn { streamRowTiming: streamRowTiming, streamPlan: streamPlan };");
const T = timingFn(consts.STREAM_BASE, consts.STREAM_PER_CHAR, consts.STREAM_MIN, consts.STREAM_MAX,
  consts.COMPRESSED_FACTOR, consts.COMPRESSED_MIN, consts.COMPRESSED_MAX,
  consts.WORD_MS_MIN, consts.WORD_MS_MAX, consts.REFORM_WORD_MS, consts.REFORM_GAP_MS, consts.THINK_MS);
const words = (n, len) => Array.from({ length: n }, () => "x".repeat(len || 5)).join(" ");
const fakeLayer = (texts) => ({ querySelectorAll: () => texts });
check("a row's stream total is monotonic in its length",
  T.streamRowTiming(words(6), "full").total < T.streamRowTiming(words(12), "full").total
  && T.streamRowTiming(words(12), "full").total < T.streamRowTiming(words(20), "full").total);
check("per-word intervals stay inside [18, 55]ms at every length",
  [words(2), words(9), words(16), words(24)].every(function (t) {
    const ms = T.streamRowTiming(t, "full").ms;
    return ms >= 18 && ms <= 55;
  }));
check("compressed totals track the full shape at x0.6 (within one interval quantum per word)",
  Math.abs(T.streamRowTiming(words(12), "compressed").total - T.streamRowTiming(words(12), "full").total * 0.6) <= 12
  && T.streamRowTiming(words(24), "compressed").total <= 450);
check("reform streams both Coach lines at 26ms/word with exactly one 90ms gap",
  T.streamPlan(fakeLayer([words(10), words(8)]), "reform").total === 18 * 26 + 90);
check("a full 3-point answer's plan (dots beat included) never exceeds the old composition's worst case",
  T.streamPlan(fakeLayer([words(16), words(14), words(15)]), "full", false).total <= 750 * 3);

/* 4. Dots budget + snap contract. */
check("streamRows fades the dots as the first row starts streaming (Step 86 budget path intact)",
  sliceFn(demoJs, "function streamRows(", "\n  function finishRender(").includes("if (i === 0 && dotsSpanOf(li)) { fadeThinkingDots(li, schedule); }"));
check("the interruption snap flattens every row's words and rests the layer whole",
  sliceFn(demoJs, "function snapLayerLanded(", "function hideRows(").includes("flattenWords(li)")
  && sliceFn(demoJs, "function hideRows(", "/* The interruption snap").includes("flattenWords(li)"));

/* 5. The ambush lands once. */
check("the scene builds no intermediate concise layer; Rapid is generated directly",
  !/sceneA\.concise/.test(js) && !js.includes("Faster still")
  && js.includes("sceneAsk(t + 0.35, sceneQ.follow, sceneA.rapid, {")
  && js.includes('statusText: "The follow-up came fast — the answer shortened itself."'));
check("the scene's layer registry matches the single landing (story / why / rapid)",
  /sceneAnswerLayers = \[sceneA\.story, sceneA\.why, sceneA\.rapid\];/.test(js));

/* 6. The card mechanism: hug + compensation, scene and classic. */
check("inactive classic layers leave the flow; the card carries the reservation",
  /\.app-card--answer \.demo-answer-stack > \.is-hidden \{ display: none; \}/.test(clean)
  && /\.call-main \.app-card--answer,\s*\.demo-body \.app-card--answer \{ transition: min-height/.test(clean)
  && /\.demo-question-stack \{ transition: height/.test(clean));
check("syncAnswerCard compensates the card for the question's height, in both modes",
  /function syncAnswerCard\(\)/.test(demoJs)
  && demoJs.includes("var comp = Math.max(0, qMax - qNow);")
  && demoJs.includes("var ccomp = Math.max(0, classicQuestionMax - qNow);")
  && demoJs.includes('questionStack.style.height = qNow + "px";'));
check("the scene reservation is the card's own measured height (formula is only a fallback)",
  /function measureSceneCard\(\)/.test(demoJs)
  && demoJs.includes("if (!sceneCardMin) { measureSceneCard(); }")
  && demoJs.includes("answerCardEl.style.minHeight = (sceneCardMin + comp).toFixed(1) + \"px\";"));
check("the card dance measures under the tallest scene status (wrap-proof reservation)",
  demoJs.includes("SCENE_MEASURE_STATUSES.forEach")
  && ["The follow-up came fast — the answer shortened itself.",
      "A harder question — its answer was already in the question bank.",
      "The closing question — the same preparation answers it.",
      "You answer — the three points, in your own words.",
      "You answer — one line, said in seconds.",
      "You answer — the difficult-project story, already prepared.",
      "You answer — calm, because it was ready.",
      "3 points ready — sample.", "Preparing your points…"]
     .every(function (s) { return demoJs.includes('"' + s + '"'); })
  && (js.match(/statusText: "/g) || []).length >= 3);
check("the classic card is measured whole too (flip row + status wrap), compensation on top",
  /function measureClassicCard\(\)/.test(demoJs)
  && demoJs.includes("if (!classicCardMin) { measureClassicCard(); }")
  && demoJs.includes('answerCardEl.style.minHeight = (classicCardMin + ccomp).toFixed(1) + "px";')
  && demoJs.includes("CLASSIC_MEASURE_STATUSES.forEach")
  && demoJs.includes("if (lh > maxA) { maxA = lh; classicCardMaxLayer = l; }"));
check("the sample tag is measured un-hidden (its margin-box), never from a hidden state",
  /function measureTagHeight\(\)/.test(demoJs)
  && sliceFn(demoJs, "function measureTagHeight(", "function sceneReserveHeights(").includes('sampleTagEl.classList.remove("is-hidden")'));

/* 7. Tile/window clearance in the unfolded band. */
check("in the <=933 band the window narrows symmetrically, clear of frame and label (Step 90 re-pin, annotated: the cap is 248px now — 124px per side; its collision job is superseded by the field's reserved bottom lane, and the measured side clearances are 24px participant / 20px self at cap-bound widths)",
  /@media \(max-width: 933px\) \{[\s\S]*?\.call-main \.app-window \{ width: min\(432px, calc\(100% - 248px\)\); \}/.test(clean));
check("the phone strip restates width:auto so the band cap never reaches 403",
  css.includes("Step 87: the phone window is in-flow at its natural width")
  && /\.call-main \.app-window \{ width: auto; \}/.test(clean));

/* 8. The chip hugs its content (phone). */
check("the phone chip is fit-content, centred, balanced — no dead half, no orphan wrap",
  /\.call-tile > \.call-tile-label \{[^}]*width: fit-content;[^}]*text-align: center;[^}]*text-wrap: balance;/.test(clean));

/* 9. The speaking indicator, redesigned (halo + chip meter).
   The interim bars-in-the-chip placement is superseded by the
   owner's approved redesign (avatar-expand-affordance report,
   Part 2): the bars are DELETED; the frame carries a halo on a
   smoothed real envelope (--lvl) and the chip carries a 3-dot
   meter on the same scalar.
   Step 89: the meter half of that design is itself superseded
   by the owner's direct order (see the deletion check below);
   the halo half stands, and gains the self tile's turn signal. */
check("the waveform bars are deleted from markup and sheet, keyframes included",
  !/call-wave|call-self-wave/.test(html) && !/call-wave|call-self-wave/.test(clean)
  && !/@keyframes call-wave/.test(clean));
check("the halo: her frame warms and glows on the --lvl envelope scalar",
  /\.call-tile\.is-speaking \.avatar-frame \{[^}]*border-color: rgba\(45, 212, 191, \.85\);[^}]*box-shadow: 0 0 0 2px rgba\(45, 212, 191, calc\(\.16 \+ \.38 \* var\(--lvl, 0\)\)\),\s*0 0 22px rgba\(45, 212, 191, calc\(\.35 \* var\(--lvl, 0\)\)\);/.test(clean));
check("the chip meter is DELETED (Step 89, the owner's direct order): no dots in markup or sheet — the halo is the only speaking signal",
  /* The owner stared at the 3-dot meter and could not tell
     what it was ("is it for the user speaking??") — a signal
     that fails comprehension is worse than none. The frame's
     halo, which every call app trains its users to read,
     carries speaking alone now. */
  !html.includes('call-dots') && !/\.call-dots/.test(clean));
check("the envelope engine: real AnalyserNode RMS for her voice, staged otherwise, 80/250ms smoothing",
  js.includes("function haloRawHer()") && js.includes("audioAnalyser.getByteTimeDomainData(haloBuf)")
  && js.includes("var tau = raw > state.lvl ? 80 : 250;")
  && js.includes("function haloStaged(t, seed)"));
check("the self tile's turn halo is NOT gated by the camera (Step 89 supersedes Step 87's camera-off truth gate on the owner's direct order)",
  /* Step 87's law was: while the camera button is the tile's
     content, no speaking indicator may render on it. Step 89's
     owner order replaces it: during the scene's "You answer"
     beats the self tile MUST carry the same halo the
     interviewer has when speaking — camera live or not — as
     the turn signal. The gate rule is deleted; what survives
     of the old law is the "You" label standing down while the
     toggle shows (identity is carried by the tile's place and
     the button's label), and the halo class itself is set
     only by the scene's candidate beats. */
  !/\.call-self\.cam-ready:not\(\.cam-on\)\.is-speaking/.test(clean)
  && /\.call-self\.is-speaking \{[^}]*border-color: var\(--accent-2\);/.test(clean)
  && /\.call-self\.cam-ready:not\(\.cam-on\) \.call-tile-label \{ display: none; \}/.test(clean));
check("the Spotlight PiP gets the border only (no glow bleed across her hero frame)",
  /\.call-stage\[data-spotlight\] \.call-self\.is-speaking \{ box-shadow: none; \}/.test(clean));
check("reduced motion: static halo, the speaking word restored at every band (Step 89: the single-dot clause is moot — the meter is deleted)",
  !/\.call-dots/.test(clean)
  && /\.call-tile \.call-speaking:not\(\[hidden\]\) \{ display: inline; \}/.test(clean));

/* 10. The Lean-In (expand affordance, Part 1 of the research). */
const spot = fs.readFileSync(path.join(root, "spotlight.js"), "utf8");
check("the expand glyph is deleted everywhere; the toggle is a bare button",
  !/spotlight-glyph/.test(html) && !/spotlight-glyph/.test(clean)
  && html.includes('<button type="button" class="avatar-toggle" id="avatar-toggle" aria-expanded="false" aria-label="See the interviewer up close" hidden></button>'));
check("the hint's elements exist: sonar ring + bare whisper, whisper copy matches the aria-label's story",
  html.includes('id="lean-ring"') && html.includes('id="spotlight-whisper"')
  && html.includes("Tap the interviewer to see her up close.")
  && /\.spotlight-whisper \{[^}]*pointer-events: none;/.test(clean));
check("--motion-pulse (900ms) is the scoped token, in the sheet and consumed by spotlight.js alone",
  /--motion-pulse: 900ms;/.test(clean)
  && spot.includes('getPropertyValue("--motion-pulse")')
  && !/--motion-pulse/.test(js));
check("the hint retires permanently: localStorage, on first use, or after two showings",
  spot.includes('var HINT_KEY = "ia-spotlight-hint";')
  && spot.includes("function retireHint()")
  && spot.includes("retireHint();\n    isOpen = true;")
  && spot.includes("if (hint.shown >= 2) { retireHint(); }"));
check("eligibility: the demo module dispatches the first-question beat; the hint performs 900ms later, in scene mode only",
  js.includes('document.dispatchEvent(new CustomEvent("ia-scene-first-question"))')
  && spot.includes('document.addEventListener("ia-scene-first-question"')
  && spot.includes("hintTimers.push(setTimeout(performHint, 900));")
  && spot.includes('stage.classList.contains("is-scene")'));
check("the performance: lean 1 -> 1.05 -> 1 and one ring, on the pulse token; second beat at +2.2s; whisper out at +5s (+6s reduced)",
  spot.includes('transform: pre + "scale(1.05)", offset: .35')
  && spot.includes("hintTimers.push(setTimeout(hintBeat, 2200));")
  && spot.includes("}, reduced ? 6000 : 5000));"));
check("hint placement is rect-based, relative to each element's own offsetParent",
  spot.includes("function placeIn(el, rect)")
  && spot.includes("parent.getBoundingClientRect()")
  && spot.includes("tileLabel.getBoundingClientRect()")
  && !/tileLabel\.offsetTop/.test(spot));
check("keyboard focus is a discovery moment (whisper + one beat) but never retires or counts",
  spot.includes('toggle.addEventListener("focus"')
  && spot.includes('toggle.matches(":focus-visible")')
  && spot.includes("focusWhisper = true;"));

console.log(`\nStep 87: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
