"use strict";
/*
 * Step 92 — the unfolded band takes the folded strip's
 * composition: participant unit top-left, self unit top-right,
 * one shared 88x170 box for both, the window hung 24px below
 * the row, the halo re-gained onto the voice's real envelope,
 * and the camera guide standing in the empty self tile.
 * Folded (<=640) and desktop (>=934) are untouched — the
 * rect-diff evidence lives with the step's report; the
 * geometry contracts are probed live by probe-step92.py.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const css = read("website/styles.css");
const js = read("website/app.js");
const spot = read("website/spotlight.js");
const demo = read("website/demo.html");
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
const has = (hay, s) => hay.includes(s);

/* A — the top row's seats and the shared box token. */
check("the participant frame takes the strip's top-left seat at the band",
  has(css, ".avatar-frame { left: 12px; top: 16px; bottom: auto; width: 88px; height: 110px; }"));
check("the name plate keeps the folded design under the portrait, at a fixed token height",
  has(css, ".call-tile > .call-tile-label { left: 12px; top: 134px; bottom: auto; width: 88px; max-width: 88px; height: 52px; font-size: 12px; padding: 8px; }"));
check("the glyph fallback re-seats inside the top-anchored frame",
  has(css, ".call-avatar { left: 28px; top: 43px; bottom: auto; }"));
check("the self tile takes the SAME 88x170 box on the same top line (the owner's equality order)",
  has(css, ".call-stage:not([data-spotlight]):not([data-spotlight-prep]) .call-self { top: 16px; bottom: auto; right: 12px; width: 88px; height: 170px; }"));
check("the window hangs at top 210 — the row's 186 plus the 24 gap",
  has(css, ".call-main .app-window { top: 210px; }"));
check("the primed field hugs the hung window at the band (418)",
  has(css, ".call-stage.is-primed .call-main { min-height: 418px; }"));
check("the window's Step 90 side cap survives verbatim (248px reserved lanes)",
  has(css, "width: min(432px, calc(100% - 248px));"));
check("the speaking word rests across the whole band — the halo is the signal (Step 89's law)",
  has(css, "  .call-speaking { display: none; }"));

/* B — the camera guide: the empty seat that reads as YOU. */
check("the guide is a ::before on the camera-off toggle tile only",
  has(css, ".call-self:not(.cam-on) .cam-toggle::before {"));
check("the guide is the camera-app head-and-shoulders outline (dashed SVG, the tile's own line language)",
  has(css, 'background: url("data:image/svg+xml,') &&
  has(css, "stroke-dasharray='5 4'") && has(css, "width: 56px; height: 64px;"));
check("the guide never enters Spotlight's PiP (suppressed there)",
  has(css, ".call-stage[data-spotlight] .call-self:not(.cam-on) .cam-toggle::before { content: none; }"));
check("the guide rides the toggle as its first flex item (above the glyph and label)",
  has(css, 'content: ""; flex: none; width: 56px; height: 64px; margin-bottom: 4px;'));

/* C — the note's home and the fit's reservation. */
check("the camera note centres under the hung window at the band",
  has(css, ".cam-note { left: 50%; right: auto; transform: translateX(-50%); width: min(432px, calc(100% - 248px)); text-align: center; }"));
check("the fit reserves the visible note's height under the window",
  has(js, "if (camNoteEl && !camNoteEl.hidden && demoWindowEl.offsetTop > 100)"));
check("every note show/hide re-runs the fit (the note can never land on the window)",
  /function camNote\(text\) \{[\s\S]{0,600}fitFieldToWindow\(\);/.test(js));

/* D — the halo re-gain: the real envelope, made visible. */
check("the level mapping is re-gained onto the shipped clips' real range",
  has(js, "(rms - 0.010) * 9.0"));
check("the smoothing tightens to a 45ms attack / 170ms release",
  has(js, "var tau = raw > state.lvl ? 45 : 170;"));
check("her frame's ring and glow amplitudes are raised to the new range",
  has(css, "box-shadow: 0 0 0 2px rgba(45, 212, 191, calc(.20 + .50 * var(--lvl, 0))),\n              0 0 26px rgba(45, 212, 191, calc(.48 * var(--lvl, 0)));"));
check("the self tile's ring matches hers (one signal language for both turns)",
  has(css, "box-shadow: 0 0 0 2px rgba(45, 212, 191, calc(.20 + .50 * var(--lvl, 0))),\n              0 0 22px rgba(45, 212, 191, calc(.48 * var(--lvl, 0)));"));
check("the level still comes from the real AnalyserNode (never staged for her)",
  has(js, "audioAnalyser.getByteTimeDomainData(haloBuf);"));

/* E — the Lean-In keeps the resting frame's own transform. */
check("spotlight.js guards the lean's base transform (leanBase)",
  has(spot, "function leanBase()"));
check("hintBeat leans from leanBase, not the hero's frameBase",
  /function hintBeat\(\) \{[\s\S]{0,500}var base = leanBase\(\);/.test(spot));

/* F — the middle decision: variant A ships (the zone stays
   empty — every real fact already has a seat). */
check("no middle element exists in the page (variant A: the row's middle stays empty)",
  !demo.includes("call-mid") && !css.includes("call-mid"));

/* G — the folded strip stands back up below 641. */
check("the phone self tile is restored by the same scoped selector, later in the sheet",
  has(css, ".call-stage:not([data-spotlight]):not([data-spotlight-prep]) .call-self { top: 14px; width: 80px; height: 52px; }") &&
  css.indexOf(".call-self { top: 16px; bottom: auto; right: 12px; width: 88px; height: 170px; }") <
  css.indexOf(".call-self { top: 14px; width: 80px; height: 52px; }"));
check("the phone window's top stands down (its own rule, the pinned cap rule untouched)",
  has(css, ".call-main .app-window { top: auto; }"));
check("the phone primed hug stands down and the guide never renders on phones",
  has(css, ".call-stage.is-primed .call-main { min-height: 0; }") &&
  has(css, ".call-self:not(.cam-on) .cam-toggle::before { content: none; }"));

/* H — the live geometry probe. */
const PY = process.env.PW_PYTHON || "python3";
let probeOk = false, probeTail = "";
try {
  const out = execFileSync(PY, [path.join(__dirname, "probe-step92.py")],
    { encoding: "utf8", timeout: 420000, stdio: ["ignore", "pipe", "pipe"] });
  probeOk = out.includes("PROBE92 OK");
  probeTail = out.trim().split("\n").slice(-3).join(" | ");
} catch (e) {
  probeTail = String(e.stdout || e.message).trim().split("\n").slice(-4).join(" | ");
}
check("probe-step92.py: equal boxes, the hung window, the guide and the note at 641–933 (" + probeTail + ")", probeOk);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
