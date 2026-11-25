/* Step 60 suite — Features page UX revision (research-led; see
   ~/workspace/step60-features-ux/research.md + report.md). Static
   pins for the revision's contracts: the glance band as the page's
   map directly under the chapter nav; DOM order = reading order in
   every chapter (Live reordered copy-first, desktop look kept by
   the flip class); the Languages reframe (the claim is the ten
   languages — Arabic & Persian are the worked RTL example, not a
   headline pair); the three within-viewport duplications removed
   (Privacy pills, Report accordion litany, Prepare pipe-note);
   the datasheet's named, side-by-side reference tables; the phone
   chapter nav sticky with 44px-family links; two-column phone
   bento. Behaviour is pinned by sim-step59-features.js and the
   Step 60 Playwright audit.
   Usage: node test-step60.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const read = (f) => fs.readFileSync(D + f, "utf8");
const html = read("features.html");
const css = read("styles.css");
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

/* ---------- 1. The glance band is the map, up front ---------- */
{
  const navEnd = html.indexOf('id="feat-nav"');
  const firstSection = html.indexOf("<section", navEnd);
  check("glance: the first section after the chapter nav is the glance band",
    firstSection > -1 && html.slice(firstSection, firstSection + 400).includes('id="glance"'));
  check("glance: it precedes Prepare and follows the hero",
    html.indexOf('id="glance"') < html.indexOf('id="prepare"')
    && html.indexOf('id="glance"') > html.indexOf('class="page-hero feat-hero"'));
  const nav = (html.match(/<nav class="feat-nav"[\s\S]*?<\/nav>/) || [""])[0];
  check("nav: first link is the glance band; the datasheet link is named for its section",
    nav.includes('<a class="feat-nav-link" href="#glance">At a glance</a>')
    && nav.includes('<a class="feat-nav-link" href="#compare">Datasheet</a>'));
  check("glance: intro promises doors to chapters (not 'back to')",
    html.includes("The whole page in ten seconds. Every tile is a door to its chapter."));
}

/* ---------- 2. Five-second test: the lead names the product ---------- */
check("hero: the lead names product, platform and occasion in its first sentence",
  html.includes("Interview Assistant is a Windows app for job interviews — a preparation and practice coach first, and a live assist tool second."));

/* ---------- 3. Reading order = DOM order (Live reordered) ---------- */
{
  const live = html.slice(html.indexOf('id="live"'), html.indexOf('id="languages"'));
  check("live: DOM reads copy before rail, and the chapter carries the flip class",
    live.includes('class="feat-chapter feat-chapter-flip"')
    && live.indexOf('class="feat-copy"') < live.indexOf('class="feat-rail"'));
  check("live: copy points at the controls where they are — under the window",
    html.includes("Try the toggle under the window")
    && html.includes("Step through the three lengths with the buttons under the window")
    && !html.includes("on the window: it swaps") && !html.includes("lengths on the window"));
  check("css60: the flip is grid order on desktop, cancelled in the single-column layout",
    css.includes(".feat-chapter-flip .feat-rail { order: -1; }")
    && css.slice(css.lastIndexOf("@media (max-width: 860px)")).includes(".feat-chapter-flip .feat-rail { order: 0; }")
    && !css.slice(css.lastIndexOf("@media (max-width: 860px)")).includes(".feat-rail { position: static; order: -1; }"));
}

/* ---------- 4. Languages reframe: ten is the claim, FA/AR the worked example ---------- */
{
  check("languages: the H2 claims the ten, not the pair",
    html.includes('<h2 id="lang-title">Ten languages, in the interviewer’s language.</h2>')
    && !html.includes("Arabic and Persian, properly right"));
  check("languages: Arabic & Persian are framed as the worked RTL example",
    html.includes("<h3>The worked example: right-to-left</h3>")
    && html.includes("that is the case we show, rather than the easiest")
    && html.includes("Arabic and Persian render right-to-left as a first-class layout"));
  check("languages: the stat strip makes the same claim (no pair in the label)",
    html.includes("<dt>languages, right-to-left included</dt>")
    && !visible.includes("Arabic & Persian RTL"));
  /* Step 62 re-pin: the switcher now carries all ten languages; the
     note frames the ten, with the RTL flip kept for Arabic/Persian. */
  check("languages: the switcher note frames the ten + the RTL flip (Step 62)",
    html.includes("re-render in each of the ten")
    && html.includes("the whole card flips right-to-left, structure arrows included"));
}

/* ---------- 5. Duplications removed (facts kept, second tellings gone) ---------- */
{
  check("privacy: the chapter card's pill row is gone from HTML and CSS; the list remains",
    !html.includes("feat-nevers") && !css.includes(".feat-nevers")
    && html.includes("<strong>Never hidden</strong>"));
  check("prepare: the pipe-note restatement is gone from HTML and CSS; the classification paragraph remains",
    !html.includes("pipe-note") && !css.includes(".pipe-note")
    && html.includes("Questions are classified as <strong>Verified</strong>"));
  const panel = html.slice(html.indexOf('id="feat-never-panel"'), html.indexOf('id="feat-never-panel"') + 600);
  check("report: the accordion adds the audio fact instead of restating the no-score litany",
    panel.includes("And no audio") && !panel.includes("No grade") && !panel.includes("pass/fail")
    && html.includes("There is no score, no grade, no pass/fail"));
}

/* ---------- 6. Datasheet: named tables, side by side ---------- */
{
  const grid = html.slice(html.indexOf('class="feat-sheet-grid"'), html.indexOf('class="feat-req"'));
  check("datasheet: shortcuts + evidence sit in the sheet grid under their own headings",
    grid.includes("<h3>Keyboard shortcuts</h3>") && grid.includes("<h3>What was tested</h3>")
    && grid.includes("Ctrl+Alt+C") && grid.includes("201 / 201"));
  check("css60: the sheet grid is two columns, one on small screens",
    css.includes(".feat-sheet-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));")
    && css.slice(css.lastIndexOf("@media (max-width: 860px)")).includes(".feat-sheet-grid { grid-template-columns: minmax(0, 1fr); }"));
}

/* ---------- 7. Phone wayfinding + bento ---------- */
{
  /* Step 95 re-pin (annotated): this slice previously ran from the
     sheet's LAST 640px block; Step 95 appends its own admitted
     640px block (the Download page's .dlx-*) after Step 60's, so
     the slice is now anchored on Step 60's own phone block —
     located by the .feat-bento rule it must contain, the same
     anchoring test-step62 uses — and bounded at the next media
     block. The asserted rules are unchanged. */
  const bentoAt = css.indexOf(".feat-bento { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }");
  const m640End = css.indexOf("@media", bentoAt);
  const m640 = css.slice(css.lastIndexOf("@media (max-width: 640px)", bentoAt),
    m640End === -1 ? undefined : m640End);
  check("css60: the chapter nav is no longer static on phones; its links are 44px-family",
    !m640.includes(".feat-nav { position: static; }")
    && m640.includes(".feat-nav-link { padding-top: 12px; padding-bottom: 12px; }"));
  check("css60: the phone bento is two columns with the Live + wide tiles spanning",
    m640.includes(".feat-bento { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }")
    && m640.includes(".feat-tile-live { grid-column: 1 / 3; }")
    && m640.includes(".feat-tile-wide { grid-column: span 2; }"));
  check("css60: still exactly 3 reduced-motion blocks in the whole sheet",
    (css.match(/@media \(prefers-reduced-motion: reduce\)/g) || []).length === 3);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
