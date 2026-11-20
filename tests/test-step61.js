/* Step 61 suite — Features audit fixes (owner-reported + measured;
   see ~/workspace/step61-features-audit/report.md). Static pins for:
   the accordion bar as ONE surface (the global h3 margin no longer
   leaves a 12px dead strip under the button, exposed as a two-tone
   band whenever the button carried its hover background); the
   accordion title's designed font (the old `font:` shorthand with
   `inherit` was invalid and silently dropped — titles rendered at
   the UA 13.33px/400 instead of 17px/600, site-wide); the report
   rows as a fixed two-column grid (the flex space-between rows had
   no value column — values started anywhere and wrapped into
   fragments); the corrected anchor landing (the stuck chrome is
   132.8px desktop / 129.1px phone, not the ~96px the 12px margin
   assumed, so headings landed behind the chapter nav); scroll
   anchoring off for the chaptered page (the Step 58 pattern), and
   the features accordion's no-JS aria truth. Behaviour (geometry,
   scroll timelines, contrast) is pinned by the Playwright audits
   kept with the report in step61-features-audit/.
   Usage: node test-step61.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("features.html");
const index = read("index.html");
const css = read("styles.css");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

/* ---------- 1. The accordion bar is one surface ---------- */
{
  check("acc: the heading inside an accordion item takes no margin",
    css.includes(".acc-item > h3 { margin: 0; }"));
  const btn = (css.match(/\.acc-btn \{([\s\S]*?)\}/) || [])[1] || "";
  const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, "");
  check("acc: the invalid font shorthand is gone from the stylesheet's code",
    !cssCode.includes("font: 600 17px/1.4 inherit"));
  check("acc: the button carries its designed font as valid longhands",
    btn.includes("font-size: 17px;") && btn.includes("font-weight: 600;")
    && btn.includes("line-height: 1.4;") && btn.includes("font-family: inherit;"));
}

/* ---------- 2. Report rows: a fixed two-column grid ---------- */
{
  check("report: all nine features report lines carry the grid modifier",
    (html.match(/app-report-line feat-report-line/g) || []).length === 9);
  check("report: the grid is two equal columns, 16px gap, top-aligned",
    css.includes(".feat-report-line { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }"));
  check("report: the home story player's rows are untouched (no modifier there)",
    !index.includes("feat-report-line"));
  const rows = [...html.matchAll(/<p class="app-report-line feat-report-line"><span>([\s\S]*?)<\/span><span>([\s\S]*?)<\/span><\/p>/g)]
    .map((m) => m[1] + " || " + m[2]);
  check("report: every row keeps its two cells and its exact facts",
    rows.length === 9
    && rows.includes("“Tell me about yourself.” || 3 points shown")
    && rows.includes("“What is your biggest weakness?” || Coach keywords shown")
    && rows.includes("“Tell me about a time you led a difficult project.” || 3 points shown")
    && rows.includes("Prepare next time || Follow-ups on the staged-rollout story")
    && rows.includes("Stored || On your PC, by default")
    && rows.includes("Trial keeps reports || 14 days")
    && rows.includes("Pro keeps reports || 365 days")
    && rows.includes("Question bank || 50–150 questions")
    && rows.includes("Classes || Verified · Hypothetical · Bridge"),
    rows.join(" ; "));
}

/* ---------- 3. Landing clearance + anchoring ---------- */
{
  check("landing: features sections clear the measured stuck chrome",
    css.includes("body:has(.feat-nav) section[id] { scroll-margin-top: 64px; }")
    && css.includes("84 + 64 = a 148px landing"));
  check("landing: the retired 12px assumption is gone",
    !css.includes("scroll-margin-top: 12px"));
  check("scroll: anchoring is off for the chaptered page (Step 58 pattern)",
    css.includes("body:has(.feat-nav) { overflow-anchor: none; }"));
}

/* ---------- 4. The hero caption row never reflows ---------- */
{
  check("hero: the caption row reserves the Replay button's height up front",
    css.includes("min-height: 48px")
    && /\.feat-caption-row \{[^}]*min-height: 48px;/.test(css));
}

/* ---------- 5. The features accordion's no-JS truth ---------- */
{
  check("acc: static HTML states the panel visible without JS (house pattern)",
    html.includes('aria-expanded="true" aria-controls="feat-never-panel"'));
}

console.log(`test-step61: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
