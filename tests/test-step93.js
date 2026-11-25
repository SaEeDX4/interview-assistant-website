"use strict";
/*
 * Step 93 — the Terms page becomes the final Terms (v1.0) in
 * Concept A, "The Reading Room": a sticky contents rail with
 * scrollspy + progress hairline (a sticky contents bar at
 * <=1024px), a non-binding "In short" summary atop each of the
 * 15 sections, §2's plans as a table + cap stat blocks, §3 as
 * paired may/must-not lists, final-terms furniture (effective
 * date, version, contact) and the site's first print stylesheet.
 * The legal text itself is pinned here in substance: the full
 * verbatim parity diff against terms-final.md is a build-time
 * verification kept with the step's report (diff_terms.py).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const css = read("website/styles.css");
const terms = read("website/terms.html");
const article = terms.split('<article class="doc"')[1].split("</article>")[0];
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
const has = (hay, s) => hay.includes(s);
const count = (hay, s) => hay.split(s).length - 1;

/* A — final, not draft: head + furniture. */
check("the title is final (no draft marker)",
  has(terms, "<title>Terms of Service — Interview Assistant</title>") &&
  !has(terms, "Terms of Service (draft)"));
check("the meta description states the effective date, not a draft warning",
  has(terms, "effective 24 November 2026") && !has(article, "DRAFT") &&
  !has(terms, "callout-draft") && !has(terms, "doc-summary"));
check("the hero meta row carries Effective + Version 1.0",
  has(terms, '<p class="doc-meta">') && has(terms, "<strong>Effective</strong> 24 November 2026") &&
  has(terms, "<strong>Version</strong> 1.0"));
check("the closing furniture repeats date, version, operator and contact",
  has(article, "Effective 24 November 2026 · Version 1.0 · CyberValida, operator of Interview Assistant"));

/* B — structure: 15 anchored sections, one summary each. */
const secIds = [...article.matchAll(/<section class="doc-sec" id="(s\d+)"/g)].map((m) => m[1]);
check("15 sections, ids s1..s15 in order",
  JSON.stringify(secIds) === JSON.stringify(Array.from({ length: 15 }, (_, i) => "s" + (i + 1))));
const tocIds = [...terms.matchAll(/<li><a href="#(s\d+)">/g)].map((m) => m[1]);
check("the contents list links all 15 sections in order",
  JSON.stringify(tocIds) === JSON.stringify(secIds));
check("every section opens with an In short summary",
  count(article, '<p class="doc-short') === 15 &&
  count(article, "<strong>In short:</strong>") === 15);
check("exactly §3 and §5 summaries are warn-ruled",
  count(article, "doc-short doc-short-warn") === 2 &&
  /id="s3"[\s\S]*?doc-short doc-short-warn/.test(article) &&
  /id="s5"[\s\S]*?doc-short doc-short-warn/.test(article));
check("§§10, 11 and 13 summaries carry the careful-reading flag",
  ["s10", "s11", "s13"].every((id) =>
    new RegExp('id="' + id + '"[\\s\\S]*?Please read this section carefully').test(article)));
check("the How-to-read intro states the summaries are non-binding and points to §13",
  has(article, "they are non-binding") && has(article, "<strong>§13</strong> explains how disputes are resolved"));

/* C — the numbers, the lists, the truths. */
check("§2 is a table: Trial/Pro columns, plan rows, price bound to checkout",
  has(article, '<table class="compare">') && has(article, "<td data-label=\"Pro\">The price shown at checkout</td>") &&
  has(article, "<td data-label=\"Trial\">30, lifetime</td>") &&
  has(article, "<td data-label=\"Pro\">600 per billing period</td>"));
check("the price 19.99 appears nowhere in the Terms text (JSON-LD's labelled sandbox note is outside the article)",
  !article.includes("19.99"));
check("the caps stand as stat blocks and in prose",
  has(article, "<b>240</b>") && has(article, "<b>120</b>") &&
  has(article, "240 live minutes per account per day, and 120 minutes per single live session"));
check("§3 is two lists: You may / You must not",
  has(article, "<h3>You may</h3>") && has(article, '<ul class="doc-may">') &&
  has(article, "<h3>You must not</h3>") && has(article, '<ul class="doc-mustnot">'));
check("the honesty lines survive verbatim",
  has(article, "does not offer a hidden mode; any claim otherwise is false") &&
  has(article, "The Service does not record your microphone or store audio") &&
  has(article, "built only from facts you confirmed"));
check("the seven resolutions are in the text (BC law, Vancouver, support@, 30-day price notice, 14-day first-payment refund, 30-day appeal)",
  has(article, "laws of the Province of British Columbia") &&
  has(article, "courts of British Columbia sitting in Vancouver") &&
  has(article, "at least 30 days’ notice of a price increase") &&
  has(article, "within 14 days of your first Pro payment") &&
  has(article, "within 30 days of it, from your account email address"));
check("the arbitration clause carries its carve-outs (Quebec, statutory claims, small claims)",
  has(article, "Consumer Protection Act (Quebec) prohibits mandatory arbitration") &&
  has(article, "Business Practices and Consumer Protection Act") &&
  has(article, "small claims court"));

/* D — the CSS system. */
check("the rail layout is a 232px rail + 760px document on the 1040 measure",
  has(css, ".doc-layout {\n  display: grid; grid-template-columns: 232px minmax(0, 760px);"));
check("section headings are 24px with the divider rhythm",
  /\.doc-sec h2 \{\s+font-size: 24px;/.test(css));
check("the summary rules: accent by default, warn for the flagged sections",
  has(css, ".doc-short {\n  font-size: 15px; color: var(--muted); border-left: 3px solid var(--accent);") &&
  has(css, ".doc-short-warn { border-left-color: var(--warn); }"));
check("the bar mode seats at the admitted 1024 breakpoint with an overlay disclosure panel",
  has(css, "@media (max-width: 1024px) {") &&
  has(css, ".doc-toc-wrap {\n    position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 41;") &&
  has(css, ".doc-sec[id] { scroll-margin-top: 64px; }"));
check("the print stylesheet exists, scoped to this page's body class",
  has(css, "@media print {") && has(css, "body.page-terms { background: var(--paper); color: var(--ink); }") &&
  has(terms, '<body class="page-terms">'));
check("the retired draft-summary CSS rules are gone",
  !/\.doc-summary\s*\{/.test(css) && !/\.doc \.doc-summary/.test(css));

/* E — the page script: scrollspy, progress, disclosure. */
check("the page carries its own scrollspy/progress script (app.js untouched)",
  has(terms, 'id="doc-progress-fill"') && has(terms, 'getElementById("doc-rail")') &&
  has(terms, 'setAttribute("aria-current", "true")') &&
  has(terms, 'toggle.setAttribute("aria-expanded"'));

/* F — the live behaviour probe. */
const PY = process.env.PW_PYTHON || "python3";
let probeOk = false, probeTail = "";
try {
  const out = execFileSync(PY, [path.join(__dirname, "probe-step93.py")],
    { encoding: "utf8", timeout: 420000, stdio: ["ignore", "pipe", "pipe"] });
  probeOk = out.includes("PROBE93 OK");
  probeTail = out.trim().split("\n").slice(-3).join(" | ");
} catch (e) {
  probeTail = String(e.stdout || e.message).trim().split("\n").slice(-4).join(" | ");
}
check("probe-step93.py: anchors, scrollspy, progress, disclosure, print at 403–1200 (" + probeTail + ")", probeOk);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
