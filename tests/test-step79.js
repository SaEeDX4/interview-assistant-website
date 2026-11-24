#!/usr/bin/env node
/* Step 79 — Demo Stage Phone UI/UX Redesign. The owner checked
   Step 78 LIVE on his Galaxy Z Fold 7 (403x928) and rejected the
   stage's UI as messy ("به هم ریخته"), with a screenshot showing:
   the Start button reading as a capsule, three competing actions
   in the primed state (Start + Watch + a Replay that existed
   before any run), a head wrapped into two accidental rows with
   dead space, four nested frames around the window, a dotted
   waveform row across the persona's chin while nothing was
   speaking, the WEBCAM chip floating mid-row, and — reported
   separately — refresh never changing the persona.
   The measured analysis (step79-stage-ux/analysis.md) found:
   U1 the radius was already 12px in source, live CSS, computed
   style AND rendered pixels (arc completes 12.0px below the top
   edge) — the capsule reading came from proportion: a 185x46px
   slab, alone on its row, under a 20px-blur glow; U2 the boot
   code unhid the whole controls bar and nothing ever hid Watch
   or Replay while primed; U3 Start 185 + gap 12 + toggle 141 =
   338px > the 319px head content width, so the head wrapped
   (129px, two improvised rows) and the controls repeated the
   pattern at 184 vs 157px widths; U4 four bordered layers
   (stage, demo card, call frame, window) nested 31px deep;
   U5 .call-wave was display:flex in every state — only its
   animation was gated on .is-speaking — and the webcam chip sat
   48px above the window it marks; U6 selection read
   sessionStorage first, which a phone refresh never clears
   (probe: load + 4 reloads -> p1,p1,p1,p1,p1).
   This suite pins the fixes' static contracts; the measured
   behaviour (state truth table, geometry, rotation across
   reloads) is pinned by the Playwright audits kept with the
   report (step79-stage-ux/work/: probe79.py, audit_states.py). */
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

/* ---------- U1: the Start button's radius is the house 12px ---------- */
check("U1: .btn carries border-radius: 12px (the RADIUS.md large-control value)",
  /\.btn \{[^}]*border-radius: 12px;/.test(clean));
check("U1: no rule overrides #scene-start's radius (only [hidden]/svg rules exist)",
  !/#scene-start\s*\{[^}]*border-radius/.test(clean) &&
  !/#scene-start[^{]*\{[^}]*border-radius/.test(clean.replace(/#scene-start\[hidden\] \{ display: none; \}/, "")) &&
  !/\.demo-head[^{]*\{[^}]*border-radius/.test(clean));

/* ---------- U2: control visibility tells the state's truth ---------- */
check("U2: one visibility driver exists and is called from every state function",
  /function setSceneControls\(state\)/.test(js) &&
  /setSceneControls\("primed"\)/.test(js) &&
  /setSceneControls\("playing"\)/.test(js) &&
  /setSceneControls\("cancelled"\)/.test(js) &&
  (js.match(/setSceneControls\("complete"\)/g) || []).length >= 2);
check("U2: primed state shows no Replay (it exists only once a run does)",
  /sceneReplayBtn\.hidden = !\(state === "playing" \|\| state === "complete" \|\|/.test(js) &&
  /\(state === "cancelled" && sceneRunStarted\)/.test(js) &&
  /sceneRunStarted = true;/.test(js));
check("U2: Watch is the primed/cancelled secondary only, hidden once a run is chosen",
  /sceneWatchBtn\.hidden = !\(state === "primed" \|\| state === "cancelled"\);/.test(js) &&
  /if \(sceneWatchBtn\) \{ sceneWatchBtn\.hidden = true; \}/.test(js));
check("U2: Mute belongs to a sounding run (set from sceneVoiced in playScene)",
  /if \(sceneMuteBtn\) \{ sceneMuteBtn\.hidden = !sceneVoiced; \}/.test(js) &&
  /if \(sceneMuteBtn && state !== "playing"\) \{ sceneMuteBtn\.hidden = true; \}/.test(js));
check("U2: Replay/Watch carry the [hidden] display guard (.btn defeats [hidden])",
  /#scene-replay\[hidden\], #scene-watch\[hidden\] \{ display: none; \}/.test(clean));

/* ---------- U3: one alignment grid for stage-level controls (<=640) ---------- */
check("U3: the phone head is a one-column grid, not a wrapping flex row",
  /\.demo-head \{ display: grid; grid-template-columns: minmax\(0, 1fr\); gap: 12px; \}/.test(clean));
check("U3: Start and the mode toggle span the full stage column on phones",
  /\.demo-head #scene-start \{ width: 100%; \}/.test(clean) &&
  /\.demo-head \.mode-toggle \{ width: 100%; margin-left: 0; \}/.test(clean) &&
  /\.demo-head \.mode-btn \{ flex: 1 1 0; \}/.test(clean));
check("U3: the scene controls take the same one-column grid on phones",
  /\.scene-controls \{ display: grid; grid-template-columns: minmax\(0, 1fr\); \}/.test(clean));

/* ---------- U4: on phones the call frame IS the stage ---------- */
check("U4: the stage wrapper's border/glow/padding stand down on phones",
  /\.demo-stage \{ padding: 0; border: 0; background: none; border-radius: 0; \}/.test(clean));
check("U4: the demo card's border and shadow stand down on phones (call frame keeps its own)",
  /\.demo-stage \.demo \{ border: 0; box-shadow: none; \}/.test(clean) &&
  /\.call-stage \{[^}]*border: 1px solid var\(--border\);/.test(clean));

/* ---------- U5: the tile row — wave only when speaking, chip anchored ---------- */
check("U5: the speaking meter is display:none until the tile is speaking (all widths)",
  /* Step 87 re-pin (annotated): U5's law — no speaking
     furniture visible at rest — survives the redesign; the
     carrier is now the chip's dot meter (the waveform bars
     are deleted). The display gate is the same shape. */
  /\.call-dots \{ display: none;/.test(clean) &&
  /\.call-tile\.is-speaking \.call-dots,\s*\.call-self\.is-speaking \.call-dots \{ display: inline-flex; \}/.test(clean)
  && !/\.call-wave/.test(clean));
/* Step 79b re-pin — the owner's eye over the metric: Step 79's
   straddle (chip centred on the window's top border via
   top: 74px) measured exact and read wrong — a stray pill
   eating the window's rim. The marker became an in-flow strip
   at the call frame's top, between the LIVE bar and the call
   area: the bezel the camera lives in, overlapping nothing.
   Step 81 re-pin — the owner's eye again: the strip rented
   34.14px of height at every width for one 60px word and read
   on his Fold as a big empty black band; the marker became a
   zero-height notch centred on the call frame's OWN top border.
   OWNER REMOVAL (2026-11-22) — the notch was rejected too, on
   the live build. Three forms, three rejections: the owner
   concluded no placement for this marker works. It is DELETED
   entirely — no element, no rules, no replacement, no new
   placement. A real video call carries no such label; the
   tiles carry the meaning. The pins below now assert absence.
   (Owner clarification, later the same night: the under-the-
   webcam FEELING was always wanted — it is now staged with a
   hardware lens in the frame's bezel and the window hanging
   beneath it; no label exists in any form, and the absence
   pins below stand exactly as written.) */
check("U5 (owner removal 2026-11-22): no webcam-marker markup remains in demo.html",
  !demo.includes("call-cam"));
check("U5 (owner removal 2026-11-22): no webcam-marker rules remain in the stylesheet (pill, strip and notch forms all deleted)",
  !/\.call-cam/.test(clean) && !clean.includes("call-cam"));
check("U5 (owner removal 2026-11-22): the frame top is clean — the LIVE bar is followed directly by the call area",
  demo.indexOf('class="call-bar"') < demo.indexOf('class="call-main"'));

/* ---------- Step 79b: the primed window's last void ---------- */
check("79b: while primed the empty sample tag leaves flow (the hint sits one body padding above the window's bottom border)",
  /\.call-stage\.is-scene\.is-primed \.demo-sample-tag \{ display: none; \}/.test(clean));

/* ---------- U6: per-load persona rotation ---------- */
check("U6: selection never consults sessionStorage (a refresh keeps the session)",
  !av.includes("window.sessionStorage") && !av.includes("ia-avatar-persona"));
check("U6: every load re-picks from the pool minus the previous load's persona",
  /var last = lstore\("ia-avatar-last"\);/.test(av) &&
  /var cands = POOL\.filter\(function \(p\) \{ return p !== last; \}\);/.test(av) &&
  /var pid = cands\[Math\.floor\(Math\.random\(\) \* cands\.length\)\];/.test(av) &&
  /lstoreSet\("ia-avatar-last", pid\);/.test(av));

console.log(`\nStep 79: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
