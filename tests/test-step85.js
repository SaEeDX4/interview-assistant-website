/* Step 85 — answer composition: "Composed, in two tenses".
   Run: node tests/test-step85.js (from
   ~/workspace/interview-assistant-website).
   The contracts pinned here (research:
   ~/workspace/answer-motion-idea/report.md, Candidate A; the
   owner's caught defect on the prototype is FLAW #1 below):
   - FLAW #1 (the dots' seat): there is NO standalone thinking
     element in the demo — the dots live inside point 1's own
     <li>, absolutely placed on its first line while its text
     span keeps the layout (visibility, never display). The
     settled label->point-1 distance therefore equals the card's
     natural spacing by construction; the Playwright audit in
     the step workspace asserts the measured equality.
   - the pending tense is the site's own: .45 opacity (the
     hero's is-pending), landed with the existing rise; the dots
     ride the named pulse .9s and crossfade out over .15s (the
     hero's E2 handoff) as point 1 goes pending. No new motion
     tokens.
   - the pending duration SHAPE: 260 + 3.2ms/char, floored and
     capped (full 300/750; compressed x0.6, 180/450) — monotonic
     in length. The metronome is gone: no revealRows, no demo
     STAGE_MS, no pointsAt in sceneAsk.
   - tempos at the call sites: scene asks compose full (the
     ambush follow-up compressed), prepared/classic answers
     compressed, a Coach view re-forms (Keywords, Structure
     +150ms), a live typed answer waits with the dots in point
     1's slot and composes full on arrival.
   - the previous answer survives a follow-up question until
     the new commit: sceneAsk swaps the answer layer inside
     the detection timer, never at question start.
   - interruption snaps: hideRows is the full reset (no tense
     residue), settleScene snaps its layer landed.
   - the status line accompanies the composition: set before
     composeRows runs, replaced only by the finished render. */
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
check("the handoff crossfades the dots out over .15s as point 1 goes pending (is-out)",
  /\.demo-answer li \.app-thinking-dots \{[^}]*transition: opacity \.15s/.test(clean)
  && /\.demo-answer li \.app-thinking-dots\.is-out \{ opacity: 0; \}/.test(clean)
  && sliceFn(demoJs, "function fadeThinkingDots(", "function listSchedule(").includes('classList.add("is-out")'));

/* 2. The two tenses, on the site's existing vocabulary. */
check("the pending tense is the hero's own .45 (demo-answer flavour)",
  /\.demo-answer li\.is-pending \{ opacity: \.45; \}/.test(clean));
check("the dots ride the named pulse .9s, like .app-thinking — no new motion token was minted",
  /\.demo-answer li \.app-thinking-dots \{[^}]*animation: pulse \.9s ease-in-out infinite alternate;/.test(clean)
  && !/--motion-5/.test(clean));
check("composeRows is the one scheduler (full / compressed / reform), reduced motion rests everything",
  /function composeRows\(layer, tempo, schedule, done, dotsAlready\) \{/.test(demoJs)
  && sliceFn(demoJs, "function composeRows(", "\n  function finishRender(").indexOf("isReducedMotion()")
     < sliceFn(demoJs, "function composeRows(", "\n  function finishRender(").indexOf('tempo === "reform"'));

/* 3. The pending-duration shape (evaluated, not eyeballed). */
const consts = {};
["PENDING_BASE", "PENDING_PER_CHAR", "PENDING_MIN", "PENDING_MAX", "COMPRESSED_FACTOR", "COMPRESSED_MIN", "COMPRESSED_MAX", "THINK_MS", "REFORM_GAP_MS"]
  .forEach(function (name) {
    const mm = demoJs.match(new RegExp("(?:var |, )" + name + " = ([0-9.]+)[;,]"));
    consts[name] = mm ? parseFloat(mm[1]) : NaN;
  });
/* Step 86 re-pin: THINK_MS 500 -> 400 on the owner's explicit order
   (dots must leave quickly; measured presence 645-655ms beat his
   ~600ms ceiling). The other constants are unchanged. */
check("the composition constants are the spec's (400 / 260+3.2 / 300-750 / x0.6 180-450 / 150)",
  consts.THINK_MS === 400 && consts.PENDING_BASE === 260 && consts.PENDING_PER_CHAR === 3.2
  && consts.PENDING_MIN === 300 && consts.PENDING_MAX === 750
  && consts.COMPRESSED_FACTOR === 0.6 && consts.COMPRESSED_MIN === 180 && consts.COMPRESSED_MAX === 450
  && consts.REFORM_GAP_MS === 150);
const pendingFn = new Function("PENDING_BASE", "PENDING_PER_CHAR", "PENDING_MIN", "PENDING_MAX", "COMPRESSED_FACTOR", "COMPRESSED_MIN", "COMPRESSED_MAX",
  sliceFn(demoJs, "function pendingMs(", "function composePlan(") + "\nreturn pendingMs;");
const pendingMs = pendingFn(consts.PENDING_BASE, consts.PENDING_PER_CHAR, consts.PENDING_MIN, consts.PENDING_MAX,
  consts.COMPRESSED_FACTOR, consts.COMPRESSED_MIN, consts.COMPRESSED_MAX);
check("pendingMs is monotonic in length (a longer point composes longer)",
  pendingMs("x".repeat(30), "full") < pendingMs("x".repeat(80), "full")
  && pendingMs("x".repeat(80), "full") < pendingMs("x".repeat(120), "full"));
check("pendingMs respects the floors and caps in both tempos",
  pendingMs("", "full") === 300 && pendingMs("x".repeat(400), "full") === 750
  && pendingMs("", "compressed") === 180 && pendingMs("x".repeat(400), "compressed") === 450);
check("compressed is the full shape at x0.6 in the unclamped middle range",
  pendingMs("x".repeat(80), "compressed") === Math.round(pendingMs("x".repeat(80), "full") * 0.6));

/* 4. The metronome is gone. */
check("no revealRows, no demo STAGE_MS, no pointsAt remain in the demo module",
  !/function revealRows\(/.test(demoJs) && !/revealRows\(/.test(demoJs)
  && !/var STAGE_MS = 400/.test(demoJs)
  && !/pointsAt/.test(sliceFn(demoJs, "function sceneAsk(", "function sceneYou(")));

/* 5. Tempos at the call sites. */
check("classic answers: Coach view re-forms, Answer view composes compressed (showAnswer)",
  sliceFn(demoJs, "function showAnswer(", "/* Step 57").includes('composeRows(layer, mode === "coach" ? "reform" : "compressed"'));
check("a matched typed sample composes at the same two tempos (showTypedMatch)",
  sliceFn(demoJs, "function showTypedMatch(", "// Step 73 — language guard").includes('composeRows(layer, mode === "coach" ? "reform" : "compressed"'));
check("a live typed answer waits with the dots in point 1's slot, then composes full (showTypedAI)",
  sliceFn(demoJs, "function showTypedAI(", "/* Step 82").includes("showThinkingDots(waitRow)")
  && sliceFn(demoJs, "function showTypedAI(", "/* Step 82").includes('composeRows(layer, "full"')
  && sliceFn(demoJs, "function showTypedAI(", "/* Step 82").includes("waitRow.children[1].textContent = b"));
check("the interruption simulator recomposes compressed (showInt)",
  sliceFn(demoJs, "function showInt(", "intBtns[0].addEventListener").includes('composeRows(layer, "compressed"'));
check("the scene's ambush follow-up composes compressed; the other asks default to full",
  js.includes('clip: "follow", speech: 1.1, tempo: "compressed"')
  && sliceFn(demoJs, "function sceneAsk(", "function sceneYou(").includes('var tempo = opts.tempo || "full";'));

/* 6. Previous-answer survival + the commit order in sceneAsk. */
const ask = sliceFn(demoJs, "function sceneAsk(", "function sceneYou(");
const askStart = ask.slice(0, ask.indexOf("var detectedAt"));
check("the previous answer survives the question: no answer swap at ask start",
  askStart.length > 0 && !/sceneShowAnswer/.test(askStart) && !/hideRows\(aLayer\)/.test(askStart));
check("at the commit: question snaps final, the layer swaps, status starts, composition runs — in that order",
  ask.indexOf("snapQuestionFinal(q)") < ask.indexOf("sceneShowAnswer(aLayer)")
  && ask.indexOf("sceneShowAnswer(aLayer)") < ask.indexOf("composeRows(aLayer, tempo, sceneSchedule")
  && ask.indexOf("setStatus(") > ask.indexOf("sceneShowAnswer(aLayer)")
  && ask.indexOf("setStatus(") < ask.indexOf("composeRows(aLayer, tempo, sceneSchedule"));
check("the scene cursor returns from the composition's own plan (composeDurationMs)",
  ask.includes("return detectedAt + composeDurationMs(aLayer, tempo, false) / 1000 + 0.5;"));

/* 7. Interruption snaps and the reset contract. */
check("hideRows is the full reset: dots cleared, pending removed, rows hidden",
  sliceFn(demoJs, "function hideRows(", "/* The interruption snap").includes("clearThinkingDots(li)")
  && sliceFn(demoJs, "function hideRows(", "/* The interruption snap").includes('classList.remove("is-pending")'));
check("settleScene snaps its settled layer landed (no half-pending residue)",
  sliceFn(demoJs, "function settleScene(", "function primeScene(").includes("snapLayerLanded(layer)"));
check("the Rapid ambush beat lands by snap, not by a reveal",
  js.includes("snapLayerLanded(sceneA.rapid)") && !/sceneReveal\(/.test(js));

/* 8. The status accompanies the composition. */
check("showAnswer sets Preparing before composing and schedules no competing status timer",
  sliceFn(demoJs, "function showAnswer(", "/* Step 57").indexOf('setStatus("Preparing your points…")')
    < sliceFn(demoJs, "function showAnswer(", "/* Step 57").indexOf("composeRows(layer")
  && !/setTimeout/.test(sliceFn(demoJs, "function showAnswer(", "/* Step 57")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
