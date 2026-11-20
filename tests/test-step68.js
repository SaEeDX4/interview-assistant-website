/* Step 68 suite — How It Works hero + fears, Concept A ("The
   same instrument, extended upward", owner-approved).
   The top of the page carried 275 rendered words (hero 74 +
   fears 201, measured in step68-hero-fears-ideation); the
   owner's order was less text WITHOUT losing content, carried
   by visual modes. Concept A's contract, pinned here:
   - the 39-word lead is gone; a kicker line plus a drawn
     thread map (the stepper's own nodes / line / diamond at
     hero scale) carries the thread facts, and the page's
     thread line is the map's caption;
   - the three clocks are tiles on Step 67's grid (label line
     over qualifier line), same no-2+1-wrap geometry;
   - the fears intro is one line; each myth card is a verdict
     card — the assumption verbatim and struck through, ONE
     truth line, the proving stage's own artefact as a static
     replica, and the card's two links (primary verbatim,
     secondary shortened to its destination);
   - all 47 inventory facts survive (the item-by-item map is
     in step68-hero-fears-ideation/report.md §4; M2-1/M2-5 are
     carried verbatim at stage 5, re-pinned in test-step63);
   - no new JS: the blocks are static markup + CSS.
   Behaviour (rendered word counts at 1440 + 403x928, heights,
   internal gaps, clock + map geometry, JS-off completeness,
   zero console errors) is pinned by the Playwright audit kept
   with the report in step68-hero-fears/audit.py.
   Usage: node test-step68.js   (exit 0 = all pass) */
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

/* Static word count of the two blocks — tags become spaces
   (the rendered layout separates the same boxes), entities
   decoded. Calibrated against the Playwright audit's rendered
   counts; the ceiling is the audit's after-figure + headroom,
   so the text cannot quietly grow back. */
function blockWords(slice) {
  return slice
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}
const heroSlice = html.slice(html.indexOf('<section class="page-hero">'),
  html.indexOf('<section class="section" id="myths"'));
const mythsSlice = html.slice(html.indexOf('<section class="section" id="myths"'),
  html.indexOf('<section class="section section-soft" id="trace"'));

/* ---------- 1. The word-count ceiling ---------- */
{
  const hero = blockWords(heroSlice), myths = blockWords(mythsSlice);
  check("words: the two blocks shrank (static count, audit-calibrated)",
    hero + myths <= 245, `hero=${hero} myths=${myths} total=${hero + myths}`);
  check("words: the 39-word lead paragraph is gone",
    !html.includes('class="lead"')
    && !html.includes("one fact the candidate confirmed, the question that fact earned"));
}

/* ---------- 2. Hero: kicker + thread map + clock tiles ---------- */
{
  check("hero: the kicker line carries the contrast, the order, the openness (L-1/L-5/L-6)",
    html.includes('<p class="hw-thread-kicker">Most explanations list steps. This one follows a single thread, in the order it happens, with nothing hidden:</p>'));
  check("hero: the thread map is drawn — three numbered stations in order",
    html.includes('<figure class="hw-threadmap">')
    && html.includes('<span class="hw-tm-disc is-thread">1</span>')
    && html.includes('<span class="hw-tm-name">Fact confirmed</span>')
    && html.includes('<span class="hw-tm-name">The question it earned</span>')
    && html.includes('<span class="hw-tm-name">Three points, sourced</span>'));
  check("hero: station 1 carries the real sample fact + its thread tag (L-2)",
    html.includes('Five years building web products <span class="hw-thread-tag">'));
  check("hero: station 2 carries the question the fact earned (L-3/L-4)",
    html.includes('<span class="hw-tm-chip">“Tell me about yourself.”</span>'));
  check("hero: the caption is the page's own thread line",
    html.includes('<figcaption class="hw-thread-line hw-tm-caption">')
    && html.includes('Fact 1 → “Tell me about yourself.” → three points, sourced'));
  check("hero: the map implies no interactivity (no buttons inside the figure)",
    !html.slice(html.indexOf('<figure class="hw-threadmap">'),
      html.indexOf('</figure>')).includes("<button"));
  check("clocks: three tiles — label line over qualifier line (C-1..C-3)",
    html.includes('<p class="hw-clock"><strong>Before the day</strong><span>free · unhurried · repeatable</span></p>')
    && html.includes('<p class="hw-clock"><strong>The live seconds</strong><span>only this uses minutes</span></p>')
    && html.includes('<p class="hw-clock"><strong>Afterwards</strong><span>report stays on your PC</span></p>'));
  const block = (css.match(/\/\* -+ Step 63[\s\S]*?(?=\/\* Step 53)/) || [""])[0];
  check("clocks: Step 67's grid survives (the tiles evolve it, geometry unchanged)",
    block.includes(".hw-clocks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 24px;")
    && block.includes(".hw-clock { margin: 0; font-size: 14px; line-height: 1.5; color: var(--muted); background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }"));
  check("map css: the line is re-aimed at the outer discs' centres; phones turn it vertical",
    block.includes(".hw-threadmap .hw-nodes-line { left: 16.6667%; right: 16.6667%; }")
    && block.slice(block.lastIndexOf("@media (max-width: 640px)"))
      .includes(".hw-threadmap .hw-nodes-line { left: 22px; right: auto; top: 22px; bottom: 22px; width: 2px; height: auto; }"));
}

/* ---------- 3. Fears: one-line intro + verdict cards ---------- */
{
  check("fears: structure and anchor unchanged (F-0/F-1)",
    html.includes('<section class="section" id="myths" aria-labelledby="myths-title">')
    && html.includes('<h2 id="myths-title">Three things people assume. None of them is true.</h2>'));
  check("fears: the 40-word intro is one line (F-2/F-3/F-4)",
    html.includes('<p class="section-intro">Three assumptions arrive with every visitor. Each is wrong — and each is proven wrong in the trace below.</p>')
    && !html.includes("Every visitor arrives with a model"));
  const says = [...html.matchAll(/<p class="hw-myth-say">([^<]+)<\/p>/g)].map((m) => m[1]);
  check("fears: the three say lines stay byte-identical (M1-0/M2-0/M3-0)",
    JSON.stringify(says) === JSON.stringify(
      ["“It records me.”", "“It invents answers.”", "“It hides and works in secret.”"]));
  check("fears: verdict badges on every card (✕ by the say, ✓ by the truth)",
    (html.match(/class="hw-myth-badge is-no"/g) || []).length === 3
    && (html.match(/class="hw-myth-badge is-yes"/g) || []).length === 3);
  check("fears: the three one-line truths (M1-1..5 / M2-2..4 / M3-1..7)",
    html.includes('<p class="hw-myth-truth">Never your microphone. Never stored. It hears only the interviewer — through your headset, only while you listen.</p>')
    && html.includes('<p class="hw-myth-truth">Built only from your confirmed facts and your bank — an unconfirmed fact is never used.</p>')
    && html.includes('<p class="hw-myth-truth">Small, visible, never hides itself. You start it, you stop it, the key is yours. Only where allowed.</p>'));
  check("fears: the old refutation paragraphs are gone",
    !html.includes("It never records your microphone, and it never stores audio.")
    && !html.includes("It has nothing to invent from. Every point is built")
    && !html.includes("The window is small, visible, and never hides itself. You start listening"));
}

/* ---------- 4. The artefacts + the links ---------- */
{
  check("viz 1: stage 3's listening status, word for word, with its struck mic (M1-3)",
    html.includes('<p class="app-pill is-listening"><span class="app-pill-dot"></span><span>Listening to system audio · microphone off</span></p>')
    && html.includes('class="hw-viz-mic"'));
  check("viz 2: stage 5's source chain — Fact 1 + Fact 2 → Point 1, its own caption (M2-2)",
    html.includes('<span class="hw-viz-chip">Fact 1</span><span class="hw-viz-op">+</span><span class="hw-viz-chip">Fact 2</span><span class="hw-viz-op">→</span><span class="hw-viz-chip is-point">Point 1</span>')
    && html.includes('<p class="hw-viz-caption">Built from facts 1 + 2</p>'));
  check("viz 3: the window bar + the real show / hide key chip (M3-6)",
    html.includes('<span class="app-window-title">Interview Assistant</span>')
    && html.includes('<div class="hw-viz-window-body"><kbd>Ctrl+Alt+Space</kbd><span>show / hide</span></div>'));
  check("links: primaries verbatim, secondaries shortened to their destinations, hrefs unchanged",
    html.includes('<a href="#trace">Watch it happen — Stage 3 of the trace</a><a href="privacy.html">Privacy &amp; ethics</a>')
    && html.includes('<a href="#trace">See a point traced to its facts — Stage 5</a><a href="features.html">Features</a>')
    && html.includes('<a href="#first-run">Your controls — the first-run guide</a><a href="privacy.html">Privacy &amp; ethics</a>')
    && !html.includes("The full boundary:") && !html.includes("The evidence: Features")
    && !html.includes("Visibility, in Privacy"));
  check("viz: every replica is aria-hidden (the facts live in the truth lines)",
    (html.match(/class="hw-myth-viz" aria-hidden="true"/g) || []).length === 3);
}

/* ---------- 5. Discipline: no new JS, sheet law intact ---------- */
{
  check("js: the Step 63 module never touches the new blocks (static build)",
    !js.includes("hw-threadmap") && !js.includes("hw-tm-") && !js.includes("hw-myth-badge"));
  check("law: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
}

console.log(`test-step68: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
