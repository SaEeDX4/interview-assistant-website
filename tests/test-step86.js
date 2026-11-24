/* Step 86 — the per-persona x per-question audit's static pins.
   Run: node tests/test-step86.js (from
   ~/workspace/interview-assistant-website).
   The contracts pinned here (audit: ~/workspace/step86-per-cell-audit/
   report.md — every one of the 25 cells was also measured live in a
   browser; these pins keep the audit's static half from regressing):
   - the onset tables are complete and sane: 7 voice sources (the six
     personas + the scene fallback) x 4 lines, each with a measured
     duration, a voiced span inside it, and one onset fraction per
     word of the line it paces — first word at the span start,
     fractions strictly increasing (the voice's rhythm, never a
     metronome).
   - the words each table paces are the words the scene speaks:
     the counts match SAMPLES.tell/story/why and FOLLOW_Q exactly.
   - the thinking beat obeys the owner's ceiling as arithmetic:
     THINK_MS (400, Step 86 — tightened from 500 on his order of
     2026-11-23: "the dots must leave quickly so the answer comes
     up") + the 150 ms crossfade out must stay under ~600 ms of
     total dots presence, the budget the audit measured per cell.
   - a voiced run paces by the voice that actually sounds: the
     buffer's origin (persona vs scene) selects the table. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
const demoJs = js.split("Step 21 — hero")[0];

/* 1. The onset tables: complete, sane, word-true. */
const onsetsMatch = demoJs.match(/var SCENE_ONSETS = (\{[\s\S]*?\n  \});/);
check("SCENE_ONSETS is present in the demo module", !!onsetsMatch);
const ONSETS = onsetsMatch ? new Function("return " + onsetsMatch[1])() : {};
const SOURCES = ["p1", "p2", "p3", "p4", "p5", "p6", "scene"];
const LINES = ["tell", "follow", "story", "why"];
check("all 7 voice sources carry all 4 lines",
  SOURCES.every((s) => ONSETS[s] && LINES.every((l) => ONSETS[s][l])));
const samplesMatch = js.match(/var SAMPLES = (\{[\s\S]*?\n\});/);
const SAMPLES = samplesMatch ? new Function("return " + samplesMatch[1])() : {};
const followMatch = demoJs.match(/var FOLLOW_Q = "([^"]+)"/);
const LINE_TEXT = {
  tell: SAMPLES.tell && SAMPLES.tell.q,
  follow: followMatch && followMatch[1],
  story: SAMPLES.story && SAMPLES.story.q,
  why: SAMPLES.why && SAMPLES.why.q
};
check("the scene's four question texts are readable from the source",
  LINES.every((l) => typeof LINE_TEXT[l] === "string" && LINE_TEXT[l].length > 0));
SOURCES.forEach((s) => {
  LINES.forEach((l) => {
    const t = ONSETS[s] && ONSETS[s][l];
    if (!t) { return; }
    const words = LINE_TEXT[l].split(" ").length;
    check(`${s}/${l}: one onset per spoken word (${words}), span inside the clip, fractions strictly increasing from 0`,
      t.d > 0 && t.s[0] >= 0 && t.s[0] < t.s[1] && t.s[1] <= t.d + 1
      && t.w.length === words && t.w[0] === 0
      && t.w.every((f, i) => f >= 0 && f < 1 && (i === 0 || f > t.w[i - 1])),
      JSON.stringify(t));
  });
});

/* 2. The owner's dots budget, as arithmetic. */
const thinkMatch = demoJs.match(/var THINK_MS = (\d+);/);
const THINK_MS = thinkMatch ? parseInt(thinkMatch[1], 10) : NaN;
check("the demo thinking beat is 400 ms (Step 86 — the owner's quick-dots order)",
  THINK_MS === 400, "THINK_MS=" + THINK_MS);
check("dots presence budget: thinking beat + the 150 ms crossfade stays under the ~600 ms ceiling",
  THINK_MS + 150 <= 600, (THINK_MS + 150) + "ms");
check("the crossfade-out is the 150 ms handoff the audit measured against",
  /fadeThinkingDots[\s\S]{0,400}?\},\s*150\);/.test(demoJs));

/* 3. Pacing follows the sounding voice. */
check("a voiced run selects the onset table by the buffer's origin (persona vs scene)",
  /voiceBuf\[clip\]\.origin === "persona"[\s\S]{0,200}?SCENE_ONSETS\[src\]/.test(demoJs));
check("the settle beat after her last word is the measured 350 ms",
  /var SCENE_SETTLE_MS = 350;/.test(demoJs));

console.log(`\nStep 86: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
