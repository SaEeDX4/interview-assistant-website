/* Step 55 — Support page restructure (owner-ordered UX redesign;
   research: support-page-ux-structure-research, Option A). The
   page is a router now: ONE labelled entry that is both search
   and assistant, the conversation collapsed at rest and expanded
   in place, six topic tiles as the no-typing path, the FAQ as a
   headers-only accordion, the privacy runbook staged behind its
   one-line card, and contact as a slim strip at the bottom.
   These guards pin the new structure and the no-fact-lost rule:
   every troubleshooting fact that left the page as prose must
   still be reachable in the assistant's bank. Behaviour is
   pinned by sim-step55-assistant.js; the Step 53/54 suites keep
   pinning the functions themselves. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const sup = fs.readFileSync(path.join(root, "support.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// 1. The header is short: title + one line. The old three-line
//    lead (which pointed at sections that no longer exist) is gone.
check("header: the one-line lead describes the single entry",
  sup.includes("Describe your problem — the assistant searches the product’s own playbooks")
  && !sup.includes("Start with the FAQ — it answers the questions people actually ask"));

// 2. ONE entry. Exactly one text input on the page, visibly
//    labelled, carrying the disclosure aria for the two regions
//    it controls (results + conversation body).
check("entry: exactly one input on the page — the assistant entry",
  (sup.match(/<input/g) || []).length === 1 && sup.includes('id="sa-input"'));
check("entry: visible label is the page's one starting instruction",
  sup.includes('<label class="sa-label" for="sa-input">Describe your problem</label>'));
/* Step 56 annotation: the input is now a spec APG combobox —
   aria-controls names the listbox popup alone (the body's
   expansion is carried by the log's live region and the tiles'
   aria-controls). The at-rest value is still false. */
check("entry: input carries aria-expanded + aria-controls for results and body",
  sup.includes('aria-expanded="false" aria-controls="sa-results"'));

// 3. Calm at rest: no open chat panel, no results list, no panel
//    head. The conversation body and the results start hidden;
//    the Step 54 head (mark / name / tagline) is retired.
check("at rest: the conversation body starts collapsed",
  sup.includes('<div class="sa-body" id="sa-body" hidden>'));
/* Step 56 annotation: the results container gained its APG
   listbox role + label; still hidden and empty at rest. */
check("at rest: the results list starts hidden and empty",
  sup.includes('<div class="sa-results" id="sa-results" role="listbox" aria-label="Search results" hidden></div>'));
check("at rest: the old always-open panel head is gone",
  !sup.includes('class="sa-head"') && !sup.includes('class="sa-mark"')
  && !sup.includes('class="sa-tag"'));
check("entry: suggestion chips and the system check sit with the entry",
  sup.includes('id="sa-suggest"') && sup.includes('id="sa-check-btn"')
  && sup.indexOf('id="sa-suggest"') < sup.indexOf('id="sa-check-btn"')
  && sup.indexOf('id="sa-check-btn"') < sup.indexOf('id="sa-body"'));

// 4. Topic tiles: six calm tiles, one per main group, each wired
//    to a real bank procedure with a short bubble label.
const tiles = [...sup.matchAll(/<button class="topic-tile"[^>]*data-sa-topic="([a-z-]+)"[^>]*data-sa-label="([^"]+)"[^>]*aria-controls="sa-body">/g)];
check("tiles: six topic tiles with labels and body controls",
  tiles.length === 6, tiles.map((t) => t[1]).join(","));
check("tiles: the six groups are the page's main topics",
  ["audio-none", "signin", "minutes", "download", "demo", "privacy"]
    .every((id) => tiles.some((t) => t[1] === id)));
check("tiles: titles name the groups in task language",
  ["Audio &amp; the interviewer’s voice", "Sign-in &amp; account", "Trial &amp; minutes",
   "Download &amp; install", "The demo", "Privacy &amp; your data"]
    .every((t) => sup.includes(`<span class="topic-tile-title">${t}</span>`)));

// 5. The troubleshooting prose is off the page — and no fact was
//    lost: the load-bearing phrases of the five retired cards
//    all live in the assistant's bank now.
check("prose: the troubleshooting cards and their heading are gone",
  !sup.includes("trouble-card") && !sup.includes("<h2>Troubleshooting</h2>"));
check("no fact lost: every retired card's substance is in the bank",
  ["default playback device", "exclusive control", "will not invent a transcript",
   "it is in the stream", "cached entitlement", "30 lifetime live minutes",
   "no installer yet", "SHA-256 hash are not published"]
    .every((s) => js.includes(s)));

// 6. FAQ: still seven items, substance unchanged (the accordion
//    behaviour itself is Step 3/Step 11 territory).
check("faq: seven accordion items remain",
  (sup.match(/class="acc-item"/g) || []).length === 7);
check("faq: answers keep their substance (spot pins)",
  sup.includes("The next answer gets shorter automatically (Concise, then Rapid)")
  && sup.includes("there is no live subscription to cancel")
  && sup.includes("A deletion request shows a scoped pending/export/erase status"));

// 7. Privacy: one-line card + staged runbook, NOT in the FAQ
//    accordion. The toggle is truthful at rest, the wrap starts
//    hidden, and the runbook (h2#runbook, five steps, the
//    never-a-partial line) lives inside the wrap.
const iToggle = sup.indexOf('id="runbook-toggle"');
const iWrap = sup.indexOf('id="runbook-wrap"');
const iRunbook = sup.indexOf('<h2 id="runbook">');
check("privacy: card toggle exists, collapsed at rest, controls the wrap",
  sup.includes('id="runbook-toggle" aria-expanded="false" aria-controls="runbook-wrap"'));
check("privacy: the runbook wrap starts hidden, below its card",
  sup.includes('<div class="runbook-wrap" id="runbook-wrap" hidden>')
  && iToggle !== -1 && iToggle < iWrap && iWrap < iRunbook);
check("privacy: the runbook keeps its five steps and its honesty line",
  (sup.match(/<li><strong>/g) || []).length >= 5
  && sup.includes("A partial removal is never presented as a complete one."));
check("privacy: the runbook is not inside the FAQ accordion",
  sup.indexOf('<div class="acc">') < iToggle
  && sup.lastIndexOf('faq-p12') < iToggle);

// 8. Contact: the slim strip is the page's last section — below
//    the FAQ and the privacy section.
const iStrip = sup.indexOf('<div class="contact-strip">');
check("contact: strip sits below FAQ and privacy, address as text + mailto",
  iStrip > iWrap && sup.indexOf("<h2>Frequently asked questions</h2>") < iStrip
  && sup.includes('<a href="mailto:support@cybervalida.online">support@cybervalida.online</a>'));

// 9. The module: Step 55 machinery exists and is wired the way
//    the sim drives it — expansion, blended search over bank +
//    FAQ with type labels, tile wiring, staged Escape, and the
//    runbook disclosure with its deep-link opening.
check("module: expansion, collapse and staged Escape exist",
  js.includes("function expand()") && js.includes("function collapse()")
  && js.includes('if (!ev || ev.key !== "Escape") { return; }'));
check("module: blended search covers the bank and a FAQ index, labelled by type",
  js.includes("function searchIndex(text)") && js.includes("var FAQ_INDEX =")
  && js.includes('"Guide"') && js.includes('"FAQ"')
  && js.includes("Ask the assistant:"));
/* Step 58 annotation: the shared wiring gained a second
   parameter — containers outside the panel (tiles, symptoms)
   pass reveal=true so the module makes its one managed scroll
   after expanding; in-panel containers pass false. The "one
   wiring for all topic buttons" contract is unchanged. */
check("module: tiles, suggestions and chips share one wiring",
  js.includes("function wireTopicButtons(container, reveal)")
  && js.includes("wireTopicButtons(tilesEl, true)") && js.includes("wireTopicButtons(suggestEl, false)"));
const submitSeg = js.slice(js.indexOf("function submitQuery()"), js.indexOf("function submitQuery()") + 600);
check("module: submit expands before routing",
  submitSeg.includes("expand();") && submitSeg.indexOf("expand();") < submitSeg.indexOf("route(text);"));
check("module: runbook disclosure opens on the #runbook deep link",
  js.includes('document.getElementById("runbook-toggle")')
  && js.includes('location.hash === "#runbook"'));

// 10. CSS: the Step 55 block and the hidden-guards. [hidden] must
//     beat the display rules, or collapsed regions would leak.
check("css: hidden guards beat the display rules for all three regions",
  css.includes(".sa-results[hidden] { display: none; }")
  && css.includes(".sa-body[hidden] { display: none; }")
  && css.includes(".runbook-wrap[hidden] { display: none; }"));
/* Step 59 annotation: slice bounded at the Step 59 block (see
   test-step54.js) — Steps 55–58 CSS still fully scanned. */
const block = (css.match(/\/\* Step 55 — Support page restructure[\s\S]*?(?=\/\* -+ Step 59|$)/) || [""])[0];
check("css step55: tiles are a 3-column grid of --radius panels",
  block.includes(".topic-tiles") && block.includes("repeat(3, 1fr)")
  && block.includes(".topic-tile") && block.includes("border-radius: var(--radius)"));
/* Step 58 annotation: the phone rule also resets
   grid-auto-rows to auto — in a single column each tile is its
   own row and sizes to its content again. */
check("css step55: tiles go single-column on phones (one calm list)",
  block.includes(".topic-tiles { grid-template-columns: 1fr; grid-auto-rows: auto; }"));
check("css step55: no capsule radius, no new sticky or fixed element",
  !block.includes("999px") && !/position:\s*(sticky|fixed)/.test(block));
const SCALE = new Set(["0", "4px", "8px", "12px", "16px", "20px", "24px", "28px",
  "32px", "40px", "48px", "56px", "64px", "72px", "96px"]);
let spacingOk = block.length > 0;
for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
  for (const v of m[1].trim().split(/\s+/)) if (!SCALE.has(v)) spacingOk = false;
}
check("css step55: every margin/padding value is on the Step 9 scale", spacingOk);
const LINE_HEIGHTS = new Set(["1", "1.04", "1.12", "1.3", "1.4", "1.5", "1.6", "1.65"]);
let lhOk = block.length > 0;
for (const m of block.matchAll(/line-height:\s*([0-9.]+)/g)) {
  if (!LINE_HEIGHTS.has(m[1])) lhOk = false;
}
check("css step55: every line-height is on the typography standard", lhOk);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
