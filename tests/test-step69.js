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
const mapSlice = html.slice(html.indexOf('<figure class="hw-threadmap">'),
  html.indexOf('</figure>'));
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
  check("line: the map's track-percentage span is gone from the markup",
    !mapSlice.includes("hw-nodes-line"));
  check("line: no threadmap span rule survives in the sheet (either orientation)",
    !css.includes(".hw-threadmap .hw-nodes-line"));
  check("line: desktop segments — from each disc's centre, one station onward, behind the discs",
    block.includes(".hw-tm-node { flex: 1 1 0; min-width: 0; display: grid; justify-items: center; gap: 8px; padding: 0 8px; text-align: center; position: relative; z-index: 0; }")
    && block.includes(".hw-tm-node:not(:last-child)::after { content: \"\"; position: absolute; z-index: -1; top: 21px; left: 50%; width: 100%; height: 2px; background: var(--border); border-radius: 2px; }"));
  check("line: phone segments — vertical, own height plus the gap, landing on the next centre",
    block.slice(block.lastIndexOf("@media (max-width: 640px)"))
      .includes(".hw-tm-node:not(:last-child)::after { top: 22px; left: 21px; width: 2px; height: calc(100% + 20px); }"));
  check("line: the stepper's own track line is untouched (its span + fill survive)",
    html.includes('<span class="hw-nodes-line" aria-hidden="true"><span class="hw-nodes-fill" id="hw-nodes-fill"></span></span>')
    && css.includes(".hw-nodes-line { position: absolute; left: 22px; right: 22px; top: 22px;"));
}

/* ---------- 3. Station 3 carries the three canonical points ---------- */
{
  const POINTS = [
    "Five years building web products — most recently leading a small team on a customer-facing tool.",
    "I start from the outcome, then the trade-off I made to get there.",
    "What draws me here is this team’s focus on honest, useful software."
  ];
  const station3 = mapSlice.slice(mapSlice.indexOf('<span class="hw-tm-disc">3</span>'));
  check("station 3: the points block is present under the station name",
    station3.includes('<span class="hw-tm-name">Three points, sourced</span>')
    && station3.includes('<span class="hw-tm-points">')
    && (station3.match(/class="hw-tm-point"/g) || []).length === 3);
  check("station 3: the three points are the canonical texts, verbatim",
    POINTS.every((t) => station3.includes(`<span class="hw-tm-point">${t}</span>`)));
  check("station 3: the texts match SAMPLES.tell in app.js (single source of truth)",
    POINTS.every((t) => js.includes(`"${t}"`)));
  check("station 3: the same three texts are the stage-5 bullets the trace lights up",
    POINTS.every((t) => html.includes(`<span class="hw-bullet-text">${t}</span>`)));
  check("map: still no interactivity implied (no buttons inside the figure)",
    !mapSlice.includes("<button"));
}

/* ---------- 4. Discipline ---------- */
{
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
  check("js: app.js still never touches the map blocks (static build)",
    !js.includes("hw-tm-points") && !js.includes("hw-tm-point"));
}

console.log(`test-step69: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
