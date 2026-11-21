/* Step 69 suite — How It Works: three owner-flagged defects
   on the live page (Steps 66–68 build), fixed together.
   1. Hero width: the hero sat in `container narrow` (960px)
      while the rest of the page uses the standard container
      (1120px) — the hero was 160px narrower than its own
      page (the owner's red lines). The hero now takes the
      standard container; .narrow itself is untouched (other
      pages use it deliberately).
   2. Thread-map line: Step 68 drew it as one span whose ends
      were percentages of the track, carried by a single
      override rule over the stepper's base rule; the owner's
      live screenshot showed the base-rule fallback (a near
      full-width line past both discs). The line is now drawn
      as connector segments anchored to the nodes themselves
      (the Step 64 standard — geometry derived from the
      discs): each station except the last grows a segment
      from its own disc's centre exactly one station onward,
      so the ends land on the next disc's centre by
      construction at any track width, horizontal and
      (rotated) on phones. Measured overshoot: 0px at
      1440/1024/768/403 (audit in step69-hero-width-threadmap).
   3. Station 3 shipped empty — no artefact under "Three
      points, sourced" while stations 1–2 carried theirs.
      It now carries the thread's destination: the three
      canonical SAMPLES.tell points, verbatim, the same
      three points the trace lights up at stage 5.
   Step 71 amendment ("One Window", Step 70 Concept 1): the
   thread map this suite pinned is deleted — the owner
   rejected the 68/69 top on the live page. What survives of
   this suite's three fixes, re-pinned below: the hero still
   takes the standard container (fix 1, untouched); the
   node-anchored segment construction (fix 2) now draws the
   thread through the hero window's three scene heads, in
   both orientations; and the three canonical points (fix 3)
   are carried by the window's answer scene, over stage 5's
   own question card. The window's full contract is pinned
   in test-step71.js.
   Usage: node test-step69.js   (exit 0 = all pass) */
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
const mapSlice = html.slice(html.indexOf('<div class="hw-herowindow app-window">'),
  html.indexOf('<div class="hw-clocks"'));
const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];

/* ---------- 1. Hero width: the page's standard container ---------- */
{
  check("hero: the page-hero wrapper is the standard container",
    heroSlice.includes('<section class="page-hero">\n    <div class="container">'));
  check("hero: no narrow wrapper anywhere on this page",
    !html.includes("container narrow"));
  check("width: .narrow itself is unchanged (other pages rely on it)",
    css.includes(".narrow { max-width: 960px; }"));
  check("width: the change is page-scoped — Features still uses narrow deliberately",
    read("features.html").includes("container narrow"));
  check("width: the standard container token is untouched",
    css.includes("--container: 1120px;"));
}

/* ---------- 2. The line: node-anchored segments, no span ---------- */
{
  /* Step 71: the map is deleted; the segment construction —
     this suite's fix 2 — now draws the thread through the
     hero window's scene heads. The invariant is unchanged:
     geometry derived from the discs, never a track span. */
  check("line: no track span in the hero window, and the thread map is gone",
    !mapSlice.includes("hw-nodes-line") && !html.includes("hw-threadmap")
    && !css.includes(".hw-tm-"));
  check("line: no threadmap span rule survives in the sheet (either orientation)",
    !css.includes(".hw-threadmap .hw-nodes-line"));
  check("line: desktop segments — from each disc's centre, one scene plus the gap onward, behind the discs",
    block.includes(".hw-hw-scene { position: relative; z-index: 0; min-width: 0; display: flex; flex-direction: column; }")
    && block.includes(".hw-hw-scene:not(:last-child)::after { content: \"\"; position: absolute; z-index: -1; top: 21px; left: 50%; width: calc(100% + 24px); height: 2px; background: var(--border); border-radius: 2px; }"));
  check("line: phone segments — vertical down the rail, own height plus the gap, landing on the next centre",
    block.slice(block.lastIndexOf("@media (max-width: 640px)"))
      .includes(".hw-hw-scene:not(:last-child)::after { top: 22px; left: 21px; width: 2px; height: calc(100% + 24px); }"));
  check("line: the stepper's own track line is untouched (its span + fill survive)",
    html.includes('<span class="hw-nodes-line" aria-hidden="true"><span class="hw-nodes-fill" id="hw-nodes-fill"></span></span>')
    && css.includes(".hw-nodes-line { position: absolute; left: 22px; right: 22px; top: 22px;"));
}

/* ---------- 3. The answer scene carries the three canonical points ---------- */
{
  const POINTS = [
    "Five years building web products — most recently leading a small team on a customer-facing tool.",
    "I start from the outcome, then the trade-off I made to get there.",
    "What draws me here is this team’s focus on honest, useful software."
  ];
  /* Step 71: fix 3's carrier is now the hero window's third
     scene — stage 5's answer card, over its question card. */
  const station3 = mapSlice.slice(mapSlice.indexOf('<span class="hw-hw-disc">3</span>'));
  check("scene 3: the points block is present under the scene name",
    station3.includes('<span class="hw-hw-name">Three points, sourced</span>')
    && station3.includes('<div class="hw-hw-points">')
    && (station3.match(/class="hw-hw-point"/g) || []).length === 3);
  check("scene 3: the three points are the canonical texts, verbatim",
    POINTS.every((t) => station3.includes(`<span class="hw-hw-point-text">${t}</span>`)));
  check("scene 3: the texts match SAMPLES.tell in app.js (single source of truth)",
    POINTS.every((t) => js.includes(`"${t}"`)));
  check("scene 3: the same three texts are the stage-5 bullets the trace lights up",
    POINTS.every((t) => html.includes(`<span class="hw-bullet-text">${t}</span>`)));
  check("window: still no interactivity implied (no buttons inside it)",
    !mapSlice.includes("<button"));
}

/* ---------- 4. Discipline ---------- */
{
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("js: app.js still never touches the window blocks (static build)",
    !js.includes("hw-hw-points") && !js.includes("hw-hw-point") && !js.includes("hw-herowindow"));
}

console.log(`test-step69: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
