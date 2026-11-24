/* Step 84 — voice-tracked transcription + the Spotlight
   caption removal.
   Run: node tests/test-step84.js (from
   ~/workspace/interview-assistant-website).
   The contracts pinned here (research:
   ~/workspace/question-transcription-idea/report.md; the
   owner's "همین حس رو میخام" on the prototype):
   - every scene question line (tell / follow / story / why)
     carries a MEASURED onset table for every voice source
     (the six personas + the scene fallback): word onsets as
     fractions of the clip's voiced span, strictly
     increasing, first word at the span's start;
   - the reveal is driven off the audio clock (the scene's
     published __iaSceneClock), never a uniform metronome:
     sceneAsk contains no wstep pacing for its question;
   - the per-word tense exists in CSS on the house tokens:
     is-now = full colour, is-heard = --app-dim, the commit
     (is-committed) restores the whole line; entrances ride
     --motion-1, colour rides --motion-3, no literal durations;
   - the settle is 350ms after the speech end, the commit
     (snapQuestionFinal at detection) precedes the points
     (Step 85: the composition starts AT the commit — the
     fixed +0.4 gap is retired; see test-step85);
   - an interrupted question snaps to its final state:
     snapAllSceneQuestions runs in both cancelScene and
     settleScene, snapQuestionFinal in primeScene;
   - the Spotlight caption mirror is GONE (owner's ruling —
     it duplicated the QUESTION card): no element, no CSS,
     no mirror code; the tile's own closing caption (the
     thanks line, never a duplication) is untouched and no
     longer stands down in Spotlight;
   - the typed/classic path is untouched by the treatment:
     startTranscription has exactly one call site (sceneAsk). */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const spot = fs.readFileSync(path.join(root, "spotlight.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
function sliceFn(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  if (a === -1) { return ""; }
  const b = src.indexOf(endMarker, a + startMarker.length);
  return src.slice(a, b === -1 ? undefined : b);
}

/* 1. The onset tables: complete, well-formed, measured shape. */
const m = js.match(/var SCENE_ONSETS = (\{[\s\S]*?\n  \});/);
check("SCENE_ONSETS table exists in app.js", !!m);
let ONSETS = null;
if (m) { ONSETS = new Function("return (" + m[1] + ")")(); }
const SOURCES = ["p1", "p2", "p3", "p4", "p5", "p6", "scene"];
const LINES = { tell: 4, follow: 7, story: 10, why: 7 };
check("onset tables exist for every voice source (6 personas + scene fallback)",
  !!ONSETS && SOURCES.every((s) => ONSETS[s] && LINES && Object.keys(LINES).every((k) => !!ONSETS[s][k])));
let shapeOk = true, monoOk = true, gapOk = true;
if (ONSETS) {
  for (const s of SOURCES) {
    for (const k of Object.keys(LINES)) {
      const t = ONSETS[s][k];
      if (!t || !(t.d > 0) || !Array.isArray(t.s) || !(t.s[0] >= 0 && t.s[0] < t.s[1] && t.s[1] <= t.d)) { shapeOk = false; continue; }
      if (!Array.isArray(t.w) || t.w.length !== LINES[k] || t.w[0] !== 0) { shapeOk = false; continue; }
      const abs = t.w.map((f) => t.s[0] + f * (t.s[1] - t.s[0]));
      for (let i = 0; i < t.w.length; i++) {
        if (!(t.w[i] >= 0 && t.w[i] < 1)) { shapeOk = false; }
        if (i > 0) {
          if (!(t.w[i] > t.w[i - 1])) { monoOk = false; }
          if (abs[i] - abs[i - 1] < 30) { gapOk = false; }
        }
      }
      if (abs[abs.length - 1] >= t.s[1]) { shapeOk = false; }
    }
  }
}
check("every table is well-formed (span inside the clip, word counts match the lines, fractions in [0,1))", shapeOk);
check("onsets are strictly increasing in every table (never uniform, never backwards)", monoOk);
check("baked absolute onsets keep >=30ms between words (no two words land in the same frame)", gapOk);
check("the p1 tables reproduce the research measurements (tell span ends at the take's 1040ms line)",
  !!ONSETS && ONSETS.p1.tell.s[1] === 1040 && ONSETS.p1.why.s[1] === 1320
  && ONSETS.p1.follow.d === 1640 && ONSETS.p1.story.d === 2440);

/* 2. The pacing + transcription machinery. */
check("the settle beat is the measured 350ms (SCENE_SETTLE_MS)",
  /var SCENE_SETTLE_MS = 350;/.test(js));
check("scenePacing picks the sounding voice's table (buffer origin, duration-matched element, staged scene table)",
  js.includes("function scenePacing(") && js.includes('origin === "persona"')
  && js.includes("SCENE_ONSETS.scene[clip]"));
check("startTranscription reads the audio clock (window.__iaSceneClock), the prototype's construction",
  js.includes("function startTranscription(")
  && sliceFn(js, "function startTranscription(", "\n  /* One exchange").includes("__iaSceneClock"));
check("startTranscription has exactly one call site — sceneAsk (the typed path is never 'heard')",
  (js.match(/startTranscription\(/g) || []).length === 2);

/* 3. sceneAsk: no metronome, settle + commit order. */
const ask = sliceFn(js, "function sceneAsk(", "function sceneYou(");
check("sceneAsk paces its question by the table, not the uniform wstep",
  ask.length > 0 && !/wstep/.test(ask) && ask.includes("startTranscription(q, opts.clip, pacing)"));
check("detection lands at speech end + the settle beat (pacing.endMs + SCENE_SETTLE_MS)",
  ask.includes("pacing.endMs + SCENE_SETTLE_MS"));
check("the commit snaps the question final at detection, before the generation starts",
  /* Step 85 re-pin: the fixed +0.4s points gap is gone — at the
     commit the answer layer swaps in and the generation starts
     (its thinking beat absorbs the breath); the cursor returns
     from the plan, not from a pointsAt constant.
     Step 87 re-pin: the generation is streamRows and the plan
     is streamDurationMs (composeRows/composeDurationMs retired
     with the two tenses). */
  ask.includes("snapQuestionFinal(q)") && ask.includes("streamRows(aLayer, tempo, sceneSchedule")
  && ask.includes("streamDurationMs(aLayer, tempo, false)")
  && ask.indexOf("snapQuestionFinal(q)") < ask.indexOf("streamRows(aLayer"));

/* 4. The interruption snap. */
check("cancelScene snaps every scene question final (never left half-dim)",
  sliceFn(js, "function cancelScene(", "function settleScene(").includes("snapAllSceneQuestions()"));
check("settleScene snaps every scene question final before the settled stage lands",
  sliceFn(js, "function settleScene(", "function primeScene(").includes("snapAllSceneQuestions()"));
check("primeScene lands the tell question in its final state",
  sliceFn(js, "function primeScene(", "function playScene(").includes("snapQuestionFinal(sceneQ.tell)"));
check("reduced motion still short-circuits the whole scene to the settled state",
  sliceFn(js, "function playScene(", "/* Step 74 Pass 3").includes("isReducedMotion()")
  && sliceFn(js, "function playScene(", "/* Step 74 Pass 3").includes("settleScene()"));

/* 5. The word-tense CSS, on tokens. */
check("the NOW word is full colour, the HEARD word rests at --app-dim (both while provisional)",
  /\.scene-q\.is-provisional \.w\.is-now \{ color: var\(--app-text\); \}/.test(clean)
  && /\.scene-q\.is-provisional \.w\.is-heard \{ color: var\(--app-dim\); \}/.test(clean));
check("the commit restores the whole line (is-committed forces opacity/transform home)",
  /\.scene-q\.is-committed \.w \{ opacity: 1; transform: translateY\(0\); \}/.test(clean));
const wRule = (clean.match(/\.scene-q \.w \{[^}]*\}/) || [""])[0];
check("word entrances ride --motion-1 and colour rides --motion-3 — no literal durations in the word rule",
  wRule.includes("var(--motion-1)") && wRule.includes("var(--motion-3)") && !/\d+ms/.test(wRule));
check("unarrived words keep the reserved layout (opacity entrance, visibility via .is-hidden)",
  wRule.includes("opacity: 0") && wRule.includes("translateY(2px)"));

/* 6. The Spotlight duplication is gone; the thanks line is not. */
check("no spotlight-caption element in demo.html",
  !/spotlight-caption/.test(html));
check("no .spotlight-caption rules in the sheet",
  !/\.spotlight-caption/.test(clean));
check("spotlight.js carries no mirror (no caption id, no cloneNode, no mirrorCaption)",
  !spot.includes("spotlight-caption") && !spot.includes("cloneNode") && !spot.includes("mirrorCaption"));
check("the window's spotlight top is measured from the tile label now (labelRect.bottom + 12)",
  spot.includes("labelRect.bottom - mainRect.top"));
check("the tile's closing caption element is DELETED (Step 90 re-pin, annotated: the owner's addendum C — its empty box painted across the Spotlight portrait; the closing line's home is the window's status line now, at every width)",
  !html.includes('id="call-caption"'));
check("the closing caption no longer stands down in Spotlight",
  !/\.call-stage\[data-spotlight\] \.call-caption \{ display: none; \}/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
