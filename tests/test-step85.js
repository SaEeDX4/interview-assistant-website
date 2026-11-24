/* Step 85 — answer composition: "Composed, in two tenses".
   Run: node tests/test-step85.js (from
   ~/workspace/interview-assistant-website).
   STEP 87 RE-PIN (annotated, 2026-11-23): the owner rejected the
   two-tense motion outright ("first it's faint, then it becomes
   full… first it shows faint, then a little shake, then full")
   and Step 87 replaced it with a word-by-word generation stream
   (streamRows / streamPlan — pinned in test-step87.js). What
   Step 85 built that SURVIVES, and what this file still pins:
   - FLAW #1 (the dots' seat): there is NO standalone thinking
     element in the demo — the dots live inside point 1's own
     <li>, absolutely placed on its first line while its text
     span keeps the layout (visibility, never display). The
     settled label->point-1 distance therefore equals the card's
     natural spacing by construction.
   - the dots ride the named pulse .9s and crossfade out over
     .15s (the hero's E2 handoff) as point 1 starts streaming.
   - tempos at the call sites: scene asks generate full (the
     ambush follow-up compressed), prepared/classic answers
     compressed, a Coach view re-forms, a live typed answer
     waits with the dots in point 1's slot and generates full
     on arrival.
   - the previous answer survives a follow-up question until
     the new commit: sceneAsk swaps the answer layer inside
     the detection timer, never at question start.
   - interruption snaps: hideRows is the full reset, settleScene
     snaps its layer landed.
   - the status line accompanies the generation: set before
     streamRows runs, replaced only by the finished render.
   What DIED with the two tenses, and is pinned dead here: the
   pending tense (.45) in the demo, the pendingMs shape, the
   rise landing on demo points, and the ambush's second stage
   (the Rapid snap landing). The stream's own contracts
   (pacing shape, full-colour words, snap-on-interruption,
   the single ambush landing, the card reservations) live in
   test-step87.js. */
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

/* 1. FLAW #1: the dots' seat is point 1's own row. */
check("demo.html carries no standalone thinking element (no reserved dots band)",
  !/class="app-thinking"/.test(html) && !/id="demo-thinking"/.test(html));
check("the dots are seated inside the row: li.is-thinking is the positioning context",
  /\.demo-answer li\.is-thinking \{ position: relative; \}/.test(clean));
check("the dots ride over the row's first line (absolute, inline-start at the text's own offset)",
  /\.demo-answer li \.app-thinking-dots \{[^}]*position: absolute; inset-inline-start: 15px;/.test(clean));
check("showThinkingDots seats the dots in the row and keeps its text in layout (visibility, not display)",
  sliceFn(demoJs, "function showThinkingDots(", "function clearThinkingDots(").includes('text.style.visibility = "hidden"')
  && sliceFn(demoJs, "function showThinkingDots(", "function clearThinkingDots(").includes("li.appendChild(dots)")
  && !/style\.display/.test(sliceFn(demoJs, "function showThinkingDots(", "function fadeThinkingDots(")));
check("the handoff crossfades the dots out over .15s as point 1 starts streaming (is-out)",
  /\.demo-answer li \.app-thinking-dots \{[^}]*transition: opacity \.15s/.test(clean)
  && /\.demo-answer li \.app-thinking-dots\.is-out \{ opacity: 0; \}/.test(clean)
  && sliceFn(demoJs, "function fadeThinkingDots(", "function listSchedule(").includes('classList.add("is-out")'));

/* 2. The two tenses are gone from the demo; the stream is the
   one scheduler. (The hero keeps its own .45 — .app-answer —
   untouched; that is a different module's vocabulary.) */
check("no pending tense in the demo: no .demo-answer is-pending rule, no demo rise landing",
  !/\.demo-answer li\.is-pending/.test(clean)
  && !/\.demo-answer li\.is-new \{/.test(clean)
  && /\.app-answer li\.is-pending \{ opacity: \.45; \}/.test(clean));
check("the dots ride the named pulse .9s, like .app-thinking — no new motion token was minted",
  /\.demo-answer li \.app-thinking-dots \{[^}]*animation: pulse \.9s ease-in-out infinite alternate;/.test(clean)
  && !/--motion-5/.test(clean));
check("streamRows is the one scheduler (full / compressed / reform), reduced motion rests everything",
  /function streamRows\(layer, tempo, schedule, done, dotsAlready\) \{/.test(demoJs)
  && sliceFn(demoJs, "function streamRows(", "\n  function finishRender(").indexOf("isReducedMotion()")
     < sliceFn(demoJs, "function streamRows(", "\n  function finishRender(").indexOf('tempo === "reform"'));

/* 3. Constants: THINK_MS survives at Step 86's 400; the pending
   shape is deleted, the compressed shape survives. */
const consts = {};
["PENDING_BASE", "PENDING_PER_CHAR", "PENDING_MIN", "PENDING_MAX", "COMPRESSED_FACTOR", "COMPRESSED_MIN", "COMPRESSED_MAX", "THINK_MS"]
  .forEach(function (name) {
    const mm = demoJs.match(new RegExp("(?:var |, )" + name + " = ([0-9.]+)[;,]"));
    consts[name] = mm ? parseFloat(mm[1]) : NaN;
  });
check("THINK_MS is 400 (Step 86) and the compressed shape survives (x0.6, 180/450)",
  consts.THINK_MS === 400
  && consts.COMPRESSED_FACTOR === 0.6 && consts.COMPRESSED_MIN === 180 && consts.COMPRESSED_MAX === 450);
check("the pending constants are deleted with the tense (PENDING_BASE/PER_CHAR/MIN/MAX)",
  isNaN(consts.PENDING_BASE) && isNaN(consts.PENDING_PER_CHAR)
  && isNaN(consts.PENDING_MIN) && isNaN(consts.PENDING_MAX)
  && !/function pendingMs\(/.test(demoJs) && !/function composePlan\(/.test(demoJs)
  && !/function composeRows\(/.test(demoJs) && !/function composeDurationMs\(/.test(demoJs));

/* 4. The metronome is gone. */
check("no revealRows, no demo STAGE_MS, no pointsAt remain in the demo module",
  !/function revealRows\(/.test(demoJs) && !/revealRows\(/.test(demoJs)
  && !/var STAGE_MS = 400/.test(demoJs)
  && !/pointsAt/.test(sliceFn(demoJs, "function sceneAsk(", "function sceneYou(")));

/* 5. Tempos at the call sites. */
check("classic answers: Coach view re-forms, Answer view generates compressed (showAnswer)",
  sliceFn(demoJs, "function showAnswer(", "/* Step 57").includes('streamRows(layer, mode === "coach" ? "reform" : "compressed"'));
check("a matched typed sample generates at the same two tempos (showTypedMatch)",
  sliceFn(demoJs, "function showTypedMatch(", "// Step 73 — language guard").includes('streamRows(layer, mode === "coach" ? "reform" : "compressed"'));
check("a live typed answer waits with the dots in point 1's slot, then generates full (showTypedAI)",
  sliceFn(demoJs, "function showTypedAI(", "/* Step 82").includes("showThinkingDots(waitRow)")
  && sliceFn(demoJs, "function showTypedAI(", "/* Step 82").includes('streamRows(layer, "full"')
  && sliceFn(demoJs, "function showTypedAI(", "/* Step 82").includes("waitRow.children[1].textContent = b"));
check("the interruption simulator re-generates compressed (showInt)",
  sliceFn(demoJs, "function showInt(", "intBtns[0].addEventListener").includes('streamRows(layer, "compressed"'));
check("the scene's ambush follow-up generates compressed; the other asks default to full",
  js.includes('clip: "follow", speech: 1.1, tempo: "compressed"')
  && sliceFn(demoJs, "function sceneAsk(", "function sceneYou(").includes('var tempo = opts.tempo || "full";'));

/* 6. Previous-answer survival + the commit order in sceneAsk. */
const ask = sliceFn(demoJs, "function sceneAsk(", "function sceneYou(");
const askStart = ask.slice(0, ask.indexOf("var detectedAt"));
check("the previous answer survives the question: no answer swap at ask start",
  askStart.length > 0 && !/sceneShowAnswer/.test(askStart) && !/hideRows\(aLayer\)/.test(askStart));
check("at the commit: question snaps final, the layer swaps, status starts, generation runs — in that order",
  ask.indexOf("snapQuestionFinal(q)") < ask.indexOf("sceneShowAnswer(aLayer)")
  && ask.indexOf("sceneShowAnswer(aLayer)") < ask.indexOf("streamRows(aLayer, tempo, sceneSchedule")
  && ask.indexOf("setStatus(") > ask.indexOf("sceneShowAnswer(aLayer)")
  && ask.indexOf("setStatus(") < ask.indexOf("streamRows(aLayer, tempo, sceneSchedule"));
check("the scene cursor returns from the generation's own plan (streamDurationMs)",
  ask.includes("return detectedAt + streamDurationMs(aLayer, tempo, false) / 1000 + 0.5;"));

/* 7. Interruption snaps and the reset contract. */
check("hideRows is the full reset: dots cleared, word spans flattened, rows hidden",
  sliceFn(demoJs, "function hideRows(", "/* The interruption snap").includes("clearThinkingDots(li)")
  && sliceFn(demoJs, "function hideRows(", "/* The interruption snap").includes("flattenWords(li)"));
check("settleScene snaps its settled layer landed (no half-streamed residue)",
  sliceFn(demoJs, "function settleScene(", "function primeScene(").includes("snapLayerLanded(layer)"));
check("the ambush has no second stage left: no snap landing for Rapid, no 'Faster still' status",
  !js.includes("snapLayerLanded(sceneA.rapid)") && !js.includes("Faster still")
  && !/sceneReveal\(/.test(js));

/* 8. The status accompanies the generation. */
check("showAnswer sets Preparing before generating and schedules no competing status timer",
  sliceFn(demoJs, "function showAnswer(", "/* Step 57").indexOf('setStatus("Preparing your points…")')
    < sliceFn(demoJs, "function showAnswer(", "/* Step 57").indexOf("streamRows(layer")
  && !/setTimeout/.test(sliceFn(demoJs, "function showAnswer(", "/* Step 57")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
