/* Step 66 suite — How It Works stepper: NATURAL heights.
   Owner-reported from his real phone (Galaxy Z Fold 7,
   ~403x928 CSS px — TALLER than the 390x844 audit viewport
   Steps 63/64 were verified at): after Step 64 shipped, stages
   1–4 still showed a giant empty middle. Root cause, measured:
   every stage rendered at stage 5's height (1,630.4px at the
   owner width) and Step 64 spread each short caption across
   it — the fear line centred by paired auto margins left two
   chasms of ~330–470px inside stages 1–4 (stage 1: 339.6px
   above the fear line and 339.6px below it). At 390x844 the
   spread read as rhythm; at 928px tall it reads as a cavern.
   The fixed-height-for-captions model is retired:
   - CSS: in live mode the stage is a block and only the shown
     panel is in flow (hidden panels display: none), so the
     stage IS the shown panel's natural height. The caption is
     plain flow — count, title, body, fear, thread strip,
     clock — with the standard margins (16/16/8) and NO auto
     margins anywhere in the Step 63 block.
   - JS: a stage change glides the stage height from the old
     panel's height to the new one's (the Step 58 unfold
     technique, .34s house easing, content pre-computed). The
     transition's end — or a viewport resize — hands the
     height back to the layout, so it can never stick. The
     module keeps the Step 63 discipline pinned in
     test-step63 §9 (no timers, no page-scroll calls, no
     focus moves, no media-query calls): the glide is a CSS
     transition, and the sheet's reduced-motion rule stills
     it into an instant swap. Guarded so a layout-less DOM
     (the sim) swaps instantly, unchanged.
   - The window side was measured BEFORE touching it: its
     content already reached its bottom edge within 1px at
     every width (Step 64's composition), so the window model
     is unchanged; its flex rules now serve only the
     within-panel fill when a caption is the taller column.
   - Stage 5 is untouched: the full trace (points + facts
     card) keeps its natural height — it is the tallest stage
     (1,638.4px at the owner width) and nothing was compacted.
   Behaviour (per-stage natural heights, caption gaps, glide
   monotonicity, stage-top deviation <= 2px, rapid retarget,
   reduced-motion instant path + resize clearing, JS-off
   stack, zero console errors) is pinned by the Playwright
   audit kept with the report in step66-stepper-natural/
   audit.py (98 checks, incl. the NEW owner viewport 403x928).
   Usage: node test-step66.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const css = read("styles.css");
const js = read("app.js");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];
const mod = js.slice(js.indexOf("/* Step 63"));

/* ---------- 1. CSS: only the shown panel is in flow ---------- */
{
  check("natural: in live mode the stage is a block (the static stack stays a grid)",
    block.includes(".hw-trace.is-live .hw-stage { display: block; }")
    && block.includes(".hw-stage { display: grid; gap: 16px; }"));
  check("natural: hidden panels leave the flow entirely (no shared grid cell, no grid-area)",
    block.includes(".hw-trace.is-live .hw-panel.is-hidden { display: none; }")
    && !block.includes("grid-area: 1 / 1"));
  // Scoped to the caption's own rules: .hw-tag's margin-left:
  // auto elsewhere in the block is the house right-align inside
  // the window rows, not caption spread, and stays.
  const capRules = [...block.replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/\.(?:hw-cap|hw-thread)[^{}]*\{([^}]*)\}/g)].map((m) => m[1]).join(";");
  check("natural: no auto margin in any caption or thread-strip rule (the spread is retired)",
    capRules.length > 0 && !/margin[^;]*\bauto\b/.test(capRules), capRules.slice(0, 80));
  check("natural: the thread strip sits in flow under the fear line (standard 8px to the clock)",
    block.includes(".hw-thread { margin: 0 0 8px; }"));
}

/* ---------- 2. JS: the glide, Step 58 technique, Step 63 discipline ---------- */
{
  check("glide: the module finds the stage inside the trace",
    mod.includes('trace.querySelector(".hw-stage")'));
  check("glide: the height transition is the house unfold (.34s, house easing)",
    mod.includes('"height .34s cubic-bezier(.2,.7,.3,1)"'));
  check("glide: the transition's end hands the height back (end + cancel both settle)",
    mod.includes('addEventListener("transitionend", onStageSettled)')
    && mod.includes('addEventListener("transitioncancel", onStageSettled)')
    && mod.includes("clearStageHeight"));
  check("glide: a viewport resize hands the height back too (never locked at a stale height)",
    mod.includes('addEventListener("resize", clearStageHeight)'));
  check("glide: layout-less DOMs swap instantly (the offsetHeight guard the sim relies on)",
    mod.includes('typeof stageEl.offsetHeight !== "number"'));
  check("glide: the incoming panel is measured AFTER the swap (natural height, not the locked one)",
    mod.includes("var toH = panels[cur].offsetHeight;"));
}

/* ---------- 3. Sheet-wide law still holds ---------- */
{
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("law: no 999px anywhere in the Step 63 block (radius family intact)",
    !block.includes("999px"));
}

console.log(`test-step66: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
