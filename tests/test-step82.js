#!/usr/bin/env node
/* Step 82 — Coach on the demo page: the Answer | Coach tabs leave
   the stage head; Coach is taught inside the window instead.
   When an answer settles, one quiet control under it — "See this
   answer as Coach cues" — flips the SAME answer to its Coach form
   (three keywords + a one-line structure, in the product's own
   labelled rendering) and back. The flip is per-answer: every new
   question lands in Answer view, so no view chosen for one answer
   can silently change what the next typed question does (the old
   persistent mode suppressed live answers in Coach). Live AI
   answers have no Coach form in the data, so the flip is never
   offered for them — no invented keywords.
   The home page keeps its persistent mode toggle untouched.
   This suite also pins the garble fix: the scene's answer layers
   are registered (sceneAnswerLayers) and hidden at every
   scene→classic handoff (hideSceneAnswers) — before the fix, a
   classic render after a scene run unhid its layer over the
   still-shown scene layer and both painted in the same grid cell
   (the owner's 2026-11-22 screenshot). */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const demo = fs.readFileSync(path.join(ROOT, "website", "demo.html"), "utf8");
const index = fs.readFileSync(path.join(ROOT, "website", "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// 1. The tabs are gone from the demo head; the home toggle survives.
check("demo.html carries no mode toggle, buttons or group",
  !/mode-toggle|id="mode-answer"|id="mode-coach"/.test(demo));
check("index.html keeps its persistent mode toggle",
  /class="mode-toggle"/.test(index) && /id="mode-answer"/.test(index) && /id="mode-coach"/.test(index));

// 2. The flip lives inside the demo window, hidden until earned.
check("the Coach flip row sits in the window body, hidden, with its scent label",
  /<p class="coach-flip-row" id="coach-flip" hidden>/.test(demo) &&
  /id="coach-flip-btn"/.test(demo) &&
  /<span class="coach-flip-label">See this answer as Coach cues<\/span>/.test(demo) &&
  demo.indexOf('id="coach-flip"') > demo.indexOf('id="demo-answer-stack"'));

// 3. The Coach card below the stage tells the new truth.
check("the Coach Mode card names the flip and the app's shortcut, not a toggle above",
  !/Toggle it above/.test(demo) &&
  /flip it to Coach cues/.test(demo) &&
  /<kbd>Ctrl\+Alt\+C<\/kbd> switches live/.test(demo));

// 4. The module no longer requires the mode buttons to exist.
check("the demo module guard does not require the mode buttons",
  /if \(!questionStack \|\| !answerStack \|\| !statusEl \|\| !inputEl \|\| !formEl\) \{\s*return;\s*\}/.test(js));

// 5. The garble fix: registry + a hide at every handoff.
check("scene answer layers are registered for the classic manager",
  /* Step 87 re-pin (annotated): the registry drops sceneA.concise
     — the ambush's intermediate layer is deleted with the
     two-stage shortening; the follow-up's one answer is Rapid. */
  /var sceneAnswerLayers = \[\];/.test(js) &&
  /sceneAnswerLayers = \[sceneA\.story, sceneA\.why, sceneA\.rapid\];/.test(js) &&
  /function hideSceneAnswers\(\)/.test(js));
check("hideSceneAnswers runs at every scene-to-classic handoff and classic render",
  (js.match(/hideSceneAnswers\(\);/g) || []).length >= 6,
  "calls=" + ((js.match(/hideSceneAnswers\(\);/g) || []).length));

// 6. Coach layers are built in the product's canonical labelled form.
check("buildCoachLayer renders labelled Keywords/Structure lines, canonically classed",
  /function buildCoachLayer\(coach, rtl, lang\) \{/.test(js) &&
  /buildCoachLine\("Keywords", coach\.keys\.join\(" · "\), "app-coach-keys"\)/.test(js) &&
  /buildCoachLine\("Structure", coach\.structure, "app-coach-structure"\)/.test(js) &&
  !/function makeRow\(/.test(js) &&
  !/span\.className = "coach-keys"/.test(js));

// 7. The flip machinery: per-answer view, honest availability.
check("renderView re-renders the settled answer in the other view",
  /function renderView\(next\)/.test(js) &&
  /function refreshFlip\(\)/.test(js) &&
  /flipLabel\.textContent = mode === "coach"/.test(js));
check("the flip is never offered for a live AI answer",
  /function showTypedAI\(text\) \{\s*clearTimers\(\);\s*hideSceneAnswers\(\);[\s\S]{0,200}flipOk = false;/.test(js));
check("every new question on the demo page lands in Answer view",
  /function resetView\(\)/.test(js) &&
  /cancelScene\(\);\s*resetView\(\);\s*visitorActed = true;/.test(js) &&
  /cancelScene\(\);\s*resetView\(\);\s*var text = inputEl\.value\.trim\(\);/.test(js));
check("setMode tolerates missing buttons (demo) and still drives the home toggle",
  /function setMode\(next\) \{\s*if \(modeAnswerBtn && modeCoachBtn\)/.test(js) &&
  /if \(modeAnswerBtn\) \{\s*modeAnswerBtn\.addEventListener/.test(js) &&
  /if \(modeCoachBtn\) \{\s*modeCoachBtn\.addEventListener/.test(js));
check("playScene's mode reset is button-guarded too",
  /if \(mode !== "answer"\) \{\s*mode = "answer";\s*if \(modeAnswerBtn && modeCoachBtn\)/.test(js));
check("the flip closes an open Spotlight before re-rendering the window",
  /callStageEl\.hasAttribute\("data-spotlight"\)/.test(js) &&
  /document\.getElementById\("spotlight-close"\)/.test(js));
check("a completed run offers the flip for the why answer it settled on",
  /currentKey = "why";\s*currentQuestion = SAMPLES\.why\.q;\s*flipOk = true;\s*refreshFlip\(\);/.test(js));

// 8. Styles: canonical coach stacking + the quiet in-window flip.
check("coach lines stack label over value; the old demo keys rule is gone",
  /\.demo-answer li\.coach-line \{ flex-direction: column;/.test(clean) &&
  /\.demo-answer\.coach \{ gap: 0; \}/.test(clean) &&
  !/\.demo-answer \.coach-keys/.test(clean));
check("the flip button obeys the radius law (8px) and the app accent",
  /\.coach-flip-btn \{[^}]*border-radius: 8px;[^}]*color: var\(--app-accent\);/.test(clean));

console.log(`\nStep 82: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
