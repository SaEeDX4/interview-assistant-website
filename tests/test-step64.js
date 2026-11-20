/* Step 64 suite — How It Works stepper fill + track termination +
   closing CTA standard (three owner-reported defects, all from his
   phone, all on the Step 63 page).
   1) THE VOID: Step 63's fixed stage (height set by stage 5, the
   fullest) left stages 1–4 as content floating at the top of a
   taller box — the window ended mid-panel, caption text stopped
   ~40% down, darkness below both. The height law is unchanged
   (one fixed stage height, stepping never moves the page); each
   panel is now COMPOSED to that height: the window stretches
   (last card grows, a lone card spreads its rows, stage 5's
   points spread inside their card) and the caption is three
   zones — telling at top, fear line centred by auto margins,
   and a footer pinned to the bottom edge: the thread strip
   (five segments filled to this stage, naming only the thread
   the page already traces — no new facts) over the clock line.
   2) THE TRACK: the nodes' connecting line ran past the last
   node as a dangling stub (and short of the first), because the
   line's fixed 22px insets assumed 44px buttons while the name
   labels made the end buttons wider. The buttons are now fixed
   44px columns with the names taken out of flow (edge labels
   aligned to the card edges), so the unchanged 22px insets land
   exactly on the end boxes' centres at every width — connectors
   exist only between nodes, zero overshoot in either colour
   state (the fill rides inside the line).
   3) THE CLOSING PAIR: "Try the simulated demo" / "Get it for
   Windows" sat in a bare <p> — inline buttons TOUCHING (0px gap)
   at ragged content widths. They now sit in the site's standard
   .cta-row (flex, 12px gap — the hero-pair treatment measured
   on index/pricing at 390px), like every other CTA pair.
   Behaviour (per-stage fill fractions, bottom voids, track
   geometry in px, the CTA gap, scroll timelines, JS-off and
   reduced-motion paths) is pinned by the Playwright audit kept
   with the report in step64-stepper-fill/audit.py; the Step 63
   sim and audit still pin the mechanics themselves.
   Usage: node test-step64.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("how-it-works.html");
const css = read("styles.css");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];
const panels = [...html.matchAll(/<section class="hw-panel" data-panel="(\d)"[\s\S]*?(?=<section class="hw-panel"|<!--|<\/div>\s*<div class="hw-controls">)/g)]
  .map((m) => m[0]);

/* ---------- 1. The thread strip: one per panel, honest states ---------- */
{
  check("fill: five pre-rendered panels still present", panels.length === 5, String(panels.length));
  const strips = [...html.matchAll(/<div class="hw-thread" aria-hidden="true">/g)];
  check("fill: one thread strip per panel, decorative (progress is announced accessibly elsewhere)",
    strips.length === 5, String(strips.length));
  let statesOk = panels.length === 5;
  let orderOk = panels.length === 5;
  panels.forEach((p, i) => {
    const segs = [...p.matchAll(/<span class="hw-thread-seg( is-done| is-now)?"><\/span>/g)]
      .map((m) => (m[1] || "").trim());
    const want = [0, 1, 2, 3, 4].map((j) => (j < i ? "is-done" : j === i ? "is-now" : ""));
    if (JSON.stringify(segs) !== JSON.stringify(want)) statesOk = false;
    if (!(p.indexOf('class="hw-thread"') > -1
      && p.indexOf('class="hw-thread"') < p.indexOf('class="hw-cap-clock"'))) orderOk = false;
  });
  check("fill: each strip's segments fill exactly to its own stage (done < now < untouched)",
    statesOk);
  check("fill: the strip is the caption's footer zone (inside .hw-cap, above the clock line)",
    orderOk);
  const lines = [...html.matchAll(/<p class="hw-thread-line"><span class="hw-diamond"><\/span><span>([^<]+)<\/span><\/p>/g)]
    .map((m) => m[1]);
  check("fill: every strip names the same traced thread — no new facts, no per-stage claims",
    lines.length === 5
    && lines.every((t) => t === "Fact 1 → “Tell me about yourself.” → three points, sourced"),
    JSON.stringify(lines));
}

/* ---------- 2. The composition law in CSS ---------- */
{
  check("fill: the panel row is one full-height track, items stretch (no align-items: start)",
    block.includes("grid-template-rows: minmax(0, 1fr);")
    && !/\.hw-panel \{[^}]*align-items: start/.test(block));
  check("fill: the window stretches — frame/window/body are flex columns, window grows",
    block.includes(".hw-panel .hw-frame { display: flex; flex-direction: column; }")
    && block.includes(".hw-panel .app-window { flex: 1 1 auto; display: flex; flex-direction: column; }")
    && block.includes(".hw-panel .app-window-body { flex: 1 1 auto; display: flex; flex-direction: column; }"));
  check("fill: the last card grows and spreads; a lone card spreads its rows; the points spread",
    block.includes(".hw-panel .app-card { display: flex; flex-direction: column; }")
    && block.includes(".hw-panel .app-card:last-of-type { flex: 1 1 auto; justify-content: space-between; }")
    && block.includes(".hw-panel .hw-bullets { flex: 1 1 auto; align-content: space-between; }"));
  check("fill: the caption is a flex column; fear and thread ride auto margins (centred + footer zones)",
    block.includes(".hw-cap { display: flex; flex-direction: column; min-width: 0; }")
    && block.includes(".hw-cap .hw-cap-fear { margin-top: auto; }")
    && block.includes(".hw-thread { margin-top: auto; }"));
  check("fill: phone panels — frame row natural, caption row absorbs the rest of the stage",
    block.includes(".hw-panel { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 24px; }"));
  check("fill: segment states exist (done = dimmed accent, now = full accent)",
    block.includes(".hw-thread-seg.is-done") && block.includes(".hw-thread-seg.is-now")
    && block.includes(".hw-thread-bar { display: flex; gap: 4px; margin-bottom: 8px; }"));
}

/* ---------- 3. Track termination ---------- */
{
  check("track: node buttons are fixed 44px columns (the boxes the line was drawn for)",
    /\.hw-node \{[^}]*width: 44px; flex: none;/.test(block));
  check("track: names are out of flow, centred on their box; the name zone is reserved, not laid out",
    block.includes(".hw-node-name { position: absolute; top: 52px; left: 50%; transform: translateX(-50%);")
    && /\.hw-nodes \{[^}]*padding-bottom: 24px;/.test(block)
    && block.includes(".hw-nodes { padding-bottom: 0; }"));
  check("track: edge labels align to the card edges (first-of-type — the line span precedes the buttons)",
    block.includes(".hw-node:first-of-type .hw-node-name { left: 0; transform: none; }")
    && block.includes(".hw-node:last-of-type .hw-node-name { left: auto; right: 0; transform: none; }"));
  check("track: the line's insets are the unchanged 22px — now exactly the end boxes' centres",
    block.includes(".hw-nodes-line { position: absolute; left: 22px; right: 22px; top: 22px;"));
}

/* ---------- 4. The closing pair joins the site standard ---------- */
{
  check("cta: the closing pair sits in the standard .cta-row (12px gap, the hero-pair treatment)",
    html.includes('<p class="cta-row"><a class="btn btn-primary" href="demo.html">Try the simulated demo</a>')
    && !html.includes('<p><a class="btn btn-primary" href="demo.html">Try the simulated demo</a>'));
  check("cta: the .cta-row standard itself is untouched",
    css.includes(".cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0 12px; }"));
  check("cta: both buttons and the next-band are unchanged",
    html.includes('<a class="btn btn-secondary" href="download.html">Get it for Windows</a>')
    && html.includes('<a class="btn btn-primary" href="demo.html">Try the live demo →</a>'));
}

/* ---------- 5. Sheet-wide law still holds ---------- */
{
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("law: no 999px anywhere in the Step 63/64 block (radius family intact)",
    !block.includes("999px"));
}

console.log(`test-step64: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
