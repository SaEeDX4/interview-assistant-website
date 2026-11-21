/* Step 71 suite — How It Works top section, "One Window"
   (Step 70 research + Concept 1, owner-approved after he
   rejected the Steps 68–69 top on the live page: metric-
   green, visually weak — the thread map towered at every
   width because three unequal artefacts sat in equal
   columns, and the 641–860 Fold band was a stylesheet dead
   zone mixing both layouts at their worst).
   The contract pinned here:
   - DELETED: the thread map (all of it, incl. the Step 69
     segment geometry on stations), the clock TILES, the
     verdict-card grid (.hw-myths / .hw-myth).
   - HERO: kicker + H1 (page-scoped raise) + ONE wide window
     in the trace's own chrome (.app-window; its bar carries
     the title and the page's simulated/sample label) holding
     the three FROZEN STAGE SCENES — stage 1's fact card,
     stage 2's bank card, stage 5's answer card over its
     question card — copied verbatim at the stages' own
     scale, under the stepper's numbered discs and thread
     segments. Comparable density by construction: scenes
     are app surfaces, like with like. Static: no buttons,
     no JS.
   - CLOCKS: a boxless typographic strip on Step 67's grid
     (geometry unchanged; the tile box is deleted).
   - FEARS: full-width verdict ROWS divided by hairlines —
     rail (struck say at 24px + one-line truth), the proving
     artefact at stage scale in a 320px column, links on one
     line at the rail's foot. DOM order = reading order.
   - BAND RULES: >=861 three scenes across; 641–860 the
     window goes MOSAIC (scenes 1–2 across, the answer scene
     full-width below, its points in three mini-columns; the
     question card rests — it exists to balance the three-
     across row); <=640 everything one column (scenes down a
     left rail, harder crops — rows 4–5 of the fact/bank
     cards and the context lines rest; the full surfaces
     stand in the trace below), verdicts stacked rail ->
     artefact (max 420px) -> links from 860 down.
   - FACT CONTRACT: all 47 inventory items from
     step68-hero-fears-ideation/report.md §1 mechanically
     located in the new top (section 5 below; M2-1/M2-5 are
     carried at stage 5, as in the Step 68 map).
   Behaviour (scene heights within tolerance at every audit
   width, internal gaps, band geometry, JS-off completeness,
   zero console errors) is pinned by the Playwright audit
   kept with the report in step71-one-window/audit.py.
   Usage: node test-step71.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("how-it-works.html");
const css = read("styles.css");
const js = read("app.js");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

const heroSlice = html.slice(html.indexOf('<section class="page-hero">'),
  html.indexOf('<section class="section" id="myths"'));
const mythsSlice = html.slice(html.indexOf('<section class="section" id="myths"'),
  html.indexOf('<section class="section section-soft" id="trace"'));
const winSlice = html.slice(html.indexOf('<div class="hw-herowindow app-window">'),
  html.indexOf('<div class="hw-clocks"'));
const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];
const band860 = block.slice(block.indexOf("@media (max-width: 860px)"),
  block.indexOf("@media (max-width: 640px)"));
const band640 = block.slice(block.lastIndexOf("@media (max-width: 640px)"));

/* ---------- 1. The hero window: chrome + three frozen scenes ---------- */
{
  check("window: the trace's own chrome — bar, title with its tail span, the simulated/sample label",
    winSlice.includes('<div class="app-window-bar">')
    && winSlice.includes('<span class="app-window-title">Interview Assistant<span class="hw-hw-title-tail"> — one question, traced</span></span>')
    && winSlice.includes('<span class="hw-hw-tag">Simulated · sample data</span>')
    && winSlice.includes('<span class="app-controls" aria-hidden="true"><i>—</i><i>▢</i><i>✕</i></span>'));
  check("window: exactly three scenes, discs numbered in the thread's order, only the first lit as the thread's start",
    (winSlice.match(/class="hw-hw-scene"/g) || []).length === 3
    && (winSlice.match(/class="hw-hw-disc is-thread"/g) || []).length === 1
    && winSlice.includes('<span class="hw-hw-disc is-thread">1</span>')
    && winSlice.includes('<span class="hw-hw-disc">2</span>')
    && winSlice.includes('<span class="hw-hw-disc">3</span>'));
  check("scene 1: stage 1's fact card verbatim — label, all five rows, its context line",
    winSlice.includes('<span class="app-card-label">Confirmed facts — sample profile</span>')
    && (winSlice.match(/hw-factrow/g) || []).length === 5
    && winSlice.includes('<span>Rescued a slipping launch with staged rollouts</span>')
    && winSlice.includes('<p class="app-context">Facts the candidate did not confirm are never used — to the app, they might as well not exist.</p>'));
  check("scene 2: stage 2's bank card verbatim — label, its meta, all five rows, its context line",
    winSlice.includes('<span class="app-card-label">Question bank — sample</span><span class="app-card-meta">50–150 questions</span>')
    && (winSlice.match(/hw-qrow/g) || []).length === 5
    && winSlice.includes('<span>“What did you learn from that?”</span>')
    && winSlice.includes('<p class="app-context">Five rows of a full bank. The pipeline behind it has fifteen stages — Features walks through every one.</p>'));
  check("scene 3: stage 5's window in miniature — its question card over its answer card",
    winSlice.includes('<section class="app-card hw-hw-qcard">')
    && winSlice.includes('<span class="app-card-label">Question</span><span class="app-card-detail">Listening to system audio · microphone off</span>')
    && winSlice.includes('<p class="app-question">“Tell me about yourself.”</p>')
    && winSlice.includes('<span class="app-card-label">Answer</span><span class="app-card-meta">prepared</span>'));
  check("scene 3: the three points carry their stage-5 source lines",
    (winSlice.match(/class="hw-hw-point"/g) || []).length === 3
    && winSlice.includes('<span class="hw-hw-point-src">Built from facts 1 + 2</span>')
    && winSlice.includes('<span class="hw-hw-point-src">Built from fact 4</span>')
    && winSlice.includes('<span class="hw-hw-point-src">Built from fact 5</span>'));
  check("window: the footer strip is the page's thread line, and nothing in the window is a control",
    winSlice.includes('<p class="hw-thread-line hw-hw-foot"><span class="hw-diamond" aria-hidden="true"></span><span>Fact 1 → “Tell me about yourself.” → three points, sourced</span></p>')
    && !winSlice.includes("<button"));
  check("hero: the H1 takes the page-scoped display step (the shared page-hero clamp is untouched)",
    block.includes('body:has(.hw-trace) .page-hero h1 { font-size: clamp(32px, 4.4vw, 48px); }')
    && css.includes(".page-hero h1 { font-size: clamp(32px, 4.4vw, 44px); }"));
}

/* ---------- 2. Clocks: the boxless strip ---------- */
{
  const clockRule = (block.match(/\.hw-clock \{[^}]*\}/) || [""])[0];
  check("clocks: the tile box is deleted — the strip is type only",
    clockRule.includes("color: var(--muted);")
    && !clockRule.includes("background") && !clockRule.includes("border")
    && !clockRule.includes("padding"));
}

/* ---------- 3. Fears: verdict rows, not cards ---------- */
{
  check("rows: three verdict rows, each rail -> proof -> links in DOM order",
    (mythsSlice.match(/class="hw-verdict"/g) || []).length === 3
    && (mythsSlice.match(/class="hw-verdict-rail"/g) || []).length === 3);
  check("rows: the card grid is deleted from markup and sheet",
    !html.includes("hw-myths") && !css.includes(".hw-myths")
    && !css.includes(".hw-myth {") && !mythsSlice.includes('class="hw-myth"'));
  check("rows css: rail + 320px proof column, hairline between rows, links at the rail's foot",
    block.includes(".hw-verdict { display: grid; grid-template-columns: minmax(0, 1fr) 320px;")
    && block.includes(".hw-verdict + .hw-verdict { border-top: 1px solid var(--border); }")
    && block.includes(".hw-verdict-rail { grid-column: 1; grid-row: 1;")
    && block.includes(".hw-verdict .hw-myth-viz { grid-column: 2; grid-row: 1 / span 2;")
    && block.includes(".hw-verdict .hw-myth-links { grid-column: 1; grid-row: 2; }"));
  check("rows css: the struck say takes headline size; the truth keeps a reading measure",
    block.includes(".hw-myth-say { font-size: 24px;")
    && block.includes(".hw-myth-truth { color: var(--muted); margin: 0; max-width: 60ch; }"));
  check("proof: the artefacts take stage scale (panel padding, chip size, window radius)",
    block.includes(".hw-viz-panel { background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 12px; padding: 16px; }")
    && block.includes(".hw-viz-chip { background: var(--app-surface-2); border: 1px solid var(--app-border); border-radius: 8px; padding: 8px 12px; font-size: 13px;")
    && block.includes(".hw-viz-window { background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 12px; overflow: hidden; }"));
}

/* ---------- 4. The band rules ---------- */
{
  check("bands: three scenes across at desktop",
    block.includes(".hw-hw-scenes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }"));
  check("bands: the 641–860 mosaic, stated at 860 (desktop-first sheet)",
    band860.includes(".hw-hw-scenes { grid-template-columns: repeat(2, minmax(0, 1fr)); }")
    && band860.includes(".hw-hw-scene:last-child { grid-column: 1 / -1; }")
    && band860.includes(".hw-hw-scene:nth-child(2)::after { display: none; }")
    && band860.includes(".hw-hw-points { grid-template-columns: repeat(3, minmax(0, 1fr)); }")
    && band860.includes(".hw-hw-qcard { display: none; }"));
  check("bands: verdicts stack from 860 — rail, artefact (max 420px), links",
    band860.includes(".hw-verdict { grid-template-columns: minmax(0, 1fr); row-gap: 20px; }")
    && band860.includes(".hw-verdict .hw-myth-viz { grid-column: 1; grid-row: 2; max-width: 420px; }")
    && band860.includes(".hw-verdict .hw-myth-links { grid-column: 1; grid-row: 3; }"));
  check("bands: phones stack the scenes down a left rail, mosaic undone, segments restored vertical",
    band640.includes(".hw-hw-scenes { grid-template-columns: minmax(0, 1fr); }")
    && band640.includes(".hw-hw-points { grid-template-columns: minmax(0, 1fr); }")
    && band640.includes(".hw-hw-scene:nth-child(2)::after { display: block; }")
    && band640.includes(".hw-hw-scene { padding-left: 56px; }")
    && band640.includes(".hw-hw-disc { position: absolute; left: 0; top: 0; }")
    && band640.includes(".hw-hw-scene:not(:last-child)::after { top: 22px; left: 21px; width: 2px; height: calc(100% + 24px); }"));
  check("bands: the phone crops — card rows 4–5 and the context lines rest; the bar sheds its title tail",
    (winSlice.match(/hw-hw-crop/g) || []).length === 4
    && band640.includes(".hw-hw-crop { display: none; }")
    && band640.includes(".hw-hw-scene .app-context { display: none; }")
    && band640.includes(".hw-hw-title-tail { display: none; }")
    && band640.includes(".hw-herowindow .app-controls i:not(:last-child) { display: none; }"));
}

/* ---------- 5. The 47-fact preservation map, mechanically ---------- */
{
  const top = heroSlice + mythsSlice;
  // [id, needles, scope] — scope "top" = hero + fears slices;
  // "page" = the whole page (M2-1/M2-5 live at stage 5, the
  // Step 68 map's standing carriers).
  const MAP = [
    ["H-0", ['<p class="eyebrow">How it works</p>'], "top"],
    ["H-1", ["<h1>One question, followed end to end.</h1>"], "top"],
    ["L-1", ["Most explanations list steps."], "top"],
    ["L-2", ["<span>Five years building web products</span><span class=\"hw-thread-tag\">"], "top"],
    ["L-3", ['<span class="hw-hw-name">The question it earned</span>'], "top"],
    ["L-4", ['<span class="hw-hw-name">Three points, sourced</span>'], "top"],
    ["L-5", ["in the order it happens"], "top"],
    ["L-6", ["with nothing hidden"], "top"],
    ["C-1a", ["<strong>Before the day</strong>"], "top"],
    ["C-1b", ["free · unhurried · repeatable"], "top"],
    ["C-1c", ["free · unhurried · repeatable"], "top"],
    ["C-1d", ["free · unhurried · repeatable"], "top"],
    ["C-2a", ["<strong>The live seconds</strong>"], "top"],
    ["C-2b", ["only this uses minutes"], "top"],
    ["C-3a", ["<strong>Afterwards</strong>"], "top"],
    ["C-3b", ["report stays on your PC"], "top"],
    ["F-0", ['<p class="eyebrow">First, the fears</p>'], "top"],
    ["F-1", ['<h2 id="myths-title">Three things people assume. None of them is true.</h2>'], "top"],
    ["F-2", ["Three assumptions arrive with every visitor"], "top"],
    ["F-3", ["Each is wrong"], "top"],
    ["F-4", ["proven wrong in the trace below"], "top"],
    ["M1-0", ['<p class="hw-myth-say">“It records me.”</p>'], "top"],
    ["M1-1", ["Never your microphone"], "top"],
    ["M1-2", ["Never stored"], "top"],
    ["M1-3", ["through your headset", "Listening to system audio · microphone off"], "top"],
    ["M1-4", ["It hears only the interviewer"], "top"],
    ["M1-5", ["only while you listen"], "top"],
    ["M1-L1", ['<a href="#trace">Watch it happen — Stage 3 of the trace</a>'], "top"],
    ["M1-L2", ['<a href="privacy.html">Privacy &amp; ethics</a>'], "top"],
    ["M2-0", ['<p class="hw-myth-say">“It invents answers.”</p>'], "top"],
    ["M2-1", ["Nothing here is invented: if a fact was never confirmed, no point can stand on it"], "page"],
    ["M2-2", ["Built only from your confirmed facts", '<span class="hw-viz-chip">Fact 1</span>', '<p class="hw-viz-caption">Built from facts 1 + 2</p>'], "top"],
    ["M2-3", ["and your bank"], "top"],
    ["M2-4", ["an unconfirmed fact is never used"], "top"],
    ["M2-5", ["Every point stands on confirmed facts"], "page"],
    ["M2-L1", ['<a href="#trace">See a point traced to its facts — Stage 5</a>'], "top"],
    ["M2-L2", ['<a href="features.html">Features</a>'], "top"],
    ["M3-0", ['<p class="hw-myth-say">“It hides and works in secret.”</p>'], "top"],
    ["M3-1", ["Small, visible"], "top"],
    ["M3-2", ["visible, never hides itself"], "top"],
    ["M3-3", ["never hides itself"], "top"],
    ["M3-4", ["You start it"], "top"],
    ["M3-5", ["you stop it"], "top"],
    ["M3-6", ["the key is yours", "<kbd>Ctrl+Alt+Space</kbd>", "show / hide"], "top"],
    ["M3-7", ["Only where allowed"], "top"],
    ["M3-L1", ['<a href="#first-run">Your controls — the first-run guide</a>'], "top"],
    ["M3-L2", ['<a href="privacy.html">Privacy &amp; ethics</a>'], "top"],
  ];
  check("facts: the map enumerates exactly the 47 inventory items", MAP.length === 47,
    String(MAP.length));
  const missing = MAP.filter(([id, needles, scope]) =>
    !needles.every((n) => (scope === "page" ? html : top).includes(n)))
    .map(([id]) => id);
  check("facts: all 47 inventory items are located in the new top (or their stage-5 carriers)",
    missing.length === 0, "missing: " + missing.join(", "));
}

/* ---------- 6. Discipline ---------- */
{
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("js: app.js never touches the new blocks (static build)",
    !js.includes("hw-herowindow") && !js.includes("hw-hw-") && !js.includes("hw-verdict"));
  check("deletions: the thread-map family is gone from markup and sheet",
    !html.includes("hw-tm-") && !css.includes(".hw-tm-") && !html.includes("hw-threadmap"));
}

console.log(`test-step71: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
