#!/usr/bin/env node
/* Step 78 — Demo Mobile Truth Round. The owner checked Step 77
   LIVE on his Galaxy Z Fold 7 (403x928) and rejected the
   experience: "nothing works". His screenshots + probes of the
   local build established: (D1) the gated #demo-next card held
   552px of invisible page flow — a full dead screen between the
   help block and the interrupt card; (D2) a 44px prep->help gap
   and a 1,079px demo-foot on phones; (D3) the primed window was
   579px tall with ~265px of reserved empty middle; (D4) the hint
   named a "Start the interview" button that sat below the fold —
   the only in-stage controls were unlabelled glyphs, and tapping
   the play glyph was a genuine no-op (probe: pill unchanged,
   avatar idle after 2.5s); (D6) the tile's honesty label
   truncated to "AI interviewer — si…". The interaction audit
   then caught a real driver bug (D5): show()'s 280ms old-element
   pause captured the bare element, so when the greeting->idle->
   speaking sequence recycled an element inside that window, the
   stale timeout paused the FRONT speaking render mid-line —
   face frozen ~1.8s while the voice played (freeze probe:
   pause on the front element at ct 0.12, frame-diff 0).
   This suite pins the fixes' static contracts; the measured
   behaviour (heights, gaps, the recorded runs at 403x928 incl.
   Slow 4G and the silent path) is pinned by the Playwright
   audits kept with the report in the project workspace
   (step78-demo-mobile-truth/work/: probe_layout.py,
   audit_interact.py, probe_freeze.py, probe_glyph.py).
   Measured at 403x928, primed: window 257px (ceiling pinned
   below at 300), #demo-next 0px, Start top 396 (first
   screenful), page 6,716 -> 5,655px. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const av = fs.readFileSync(path.join(ROOT, "website", "avatar.js"), "utf8");
const demo = fs.readFileSync(path.join(ROOT, "website", "demo.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// D1 — hidden means zero height for the gated conversion card.
check("D1: #demo-next is display:none while gated (zero height)",
  /\.demo-next\.is-hidden \{ display: none; \}/.test(clean));
check("D1: the gate itself is untouched (is-hidden class swap in JS)",
  /nextEl\.classList\.add\("is-hidden"\)/.test(js) &&
  /nextEl\.classList\.remove\("is-hidden"\)/.test(js) &&
  /if \(visitorActed\) \{ showDemoNext\(\); \}/.test(js));

// D2 — phone rhythm: prep->help gap 32, demo chips two-up.
check("D2: help block follows the demo at 16px on phones (gap = 32)",
  /\.section:has\(\.call-stage\) \.help-block \{ margin-top: 16px; \}/.test(clean));
check("D2: demo sample chips go two-up with tighter padding on phones",
  /\.demo-foot \.chips-big \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/.test(clean) &&
  /\.demo-foot \.chips-big \.chip \{ padding: 8px 12px; \}/.test(clean));

// D3 — the primed window is compact; the run glides it open.
check("D3: primed scene drops the reservations (is-primed overrides)",
  /\.call-stage\.is-scene\.is-primed \.demo-question-stack \{ min-height: 0; \}/.test(clean) &&
  /\.call-stage\.is-scene\.is-primed \.demo-answer-stack \{ min-height: 0; \}/.test(clean) &&
  /\.call-stage\.is-scene\.is-primed \.demo-answer-stack > \* \{ display: none; \}/.test(clean) &&
  /\.call-stage\.is-scene\.is-primed \.demo-sample-tag \{ min-height: 0; \}/.test(clean));
check("D3: stacks glide on the house motion token when the run starts",
  /\.call-stage\.is-scene \.demo-sample-tag \{ transition: min-height var\(--motion-3\) var\(--motion-ease\); \}/.test(clean));
check("D3: prime adds is-primed; play/settle/cancel remove it",
  /callStageEl\.classList\.add\("is-primed"\)/.test(js) &&
  (js.match(/callStageEl\.classList\.remove\("is-primed"\)/g) || []).length >= 3);

// D4 — a real, labelled Start affordance in the first screenful.
check("D4: the labelled Start button lives in the demo head, hidden until JS",
  demo.indexOf('id="scene-start"') > demo.indexOf('class="demo-head"') &&
  demo.indexOf('id="scene-start"') < demo.indexOf('class="mode-toggle"') &&
  /id="scene-start" hidden/.test(demo) &&
  /#scene-start\[hidden\] \{ display: none; \}/.test(clean) &&
  /if \(sceneStartBtn\) \{ sceneStartBtn\.hidden = false; \}/.test(js));
check("D4: the button's state tells the truth (start/preparing/playing/replay)",
  /function setStartBtn\(mode, loaded\)/.test(js) &&
  /"Preparing your interviewer\\u2026"/.test(js) &&
  /"Interview playing\\u2026"/.test(js) &&
  /startBtnHome\.replace\("Start the interview", "Replay the interview"\)/.test(js) &&
  /if \(startBtnMode === "replay"\)/.test(js));
check("D4: buffer progress feeds the preparing label (real count)",
  /audioProgressFn = function \(\)/.test(js) &&
  /if \(audioProgressFn\) \{ audioProgressFn\(\); \}/.test(js) &&
  /if \(startBtnMode !== "preparing"\) \{ return; \}/.test(js));
check("D4/D5: the header play glyph routes to the labelled button; stop routes to Skip",
  /callStageEl\.querySelector\("\.app-header-controls \.app-start"\)/.test(js) &&
  /headPlayGlyph\.addEventListener\("click", function \(\) \{ sceneStartBtn\.click\(\); \}\)/.test(js) &&
  /callStageEl\.querySelector\("\.app-header-controls \.app-stop"\)/.test(js) &&
  /if \(!sceneSkipBtn\.hidden\) \{ sceneSkipBtn\.click\(\); \}/.test(js));

// D5 — the avatar driver can never sit frozen after a tap.
check("D5: the old-element pause is generation-guarded (the freeze fix)",
  /back\._gen = \(back\._gen \|\| 0\) \+ 1;/.test(av) &&
  /if \(\(old\._gen \|\| 0\) === oldGen && old !== vids\[front\]\)/.test(av));
check("D5: the stall watchdog watches every swap (resume, then format switch, then honest fail)",
  /function watchAdvance\(v, file, opts\)/.test(av) &&
  /watchAdvance\(back, file, opts\);/.test(av) &&
  /v\.dataset\.stallFile !== file/.test(av) &&
  /probe\.failed\[opts\.speakKey \|\| opts\.label \|\| file\] = "stalled";/.test(av));
check("D5: presence loops are warmed at takeover (no cold seam swaps)",
  /function warmPresence\(\)/.test(av) && /warmPresence\(\);/.test(av));

// D6 — the honesty label wraps whole at phone widths.
// Step 79 re-pin (annotated): the label's anchor changed from
// bottom:6px to vertical centring beside the thumbnail (Step 79
// U5 — it read as a floating chip); the D6 contract itself — full
// text, wraps, no nowrap/ellipsis cap — is unchanged and is still
// what this check pins.
check("D6: tile label wraps cleanly at <=640 (no nowrap/ellipsis cap)",
  /\.call-tile > \.call-tile-label \{ left: 88px; top: 50%; bottom: auto; transform: translateY\(-50%\); max-width: calc\(100% - 184px\); white-space: normal; overflow: visible; text-overflow: clip; line-height: 1\.3; \}/.test(clean) &&
  demo.includes("AI interviewer — simulated"));

// D7 — Step 73/74/77 contracts survive.
check("D7: primed state, one-context engine and rotation pins intact",
  /function primeScene\(\)/.test(js) &&
  /setScenePill\("Ready when you are", ""\)/.test(js) &&
  /soundNote\(!\(haveBuf \|\| haveEl\)\);/.test(js) &&
  av.includes('var POOL = ["p1", "p2", "p3", "p4", "p5", "p6"];') &&
  av.includes('window.__avatarPersonaId = pid;'));

console.log(`\nStep 78: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
