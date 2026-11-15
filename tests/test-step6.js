/* Step 6 mobile verification suite — pure Node, no dependencies.
   The /tmp/domtest jsdom suites were lost when the VM was replaced, so this
   suite is self-contained and lives in the project (local only, not pushed).
   It checks the Step 6 CSS/HTML fixes statically (rule existence AND order —
   the pipe-list bug was an ordering bug) plus the Step 5 invariants that
   these edits must not regress. Interactive behaviour (demo staging, finder
   logic, calculator) is untouched by this change — no app.js edits and no
   HTML structural changes except data-label attributes — and is re-verified
   by the post-push mobile screenshots, not here.
   Usage: node test-step6.js   (exit 0 = all pass) */
const fs = require("fs");
const path = require("path");

const D = path.join(__dirname, "..", "website") + path.sep;
const PAGES = ["index.html", "demo.html", "pricing.html", "features.html",
  "platforms.html", "support.html", "terms.html", "download.html",
  "how-it-works.html", "privacy.html"];
const read = (f) => fs.readFileSync(D + f, "utf8");
const css = read("styles.css");

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; console.log("FAIL " + name + (detail ? " — " + detail : "")); }
}

// ---------- A. Step 6 fixes ----------
// A1. pipe-list: 1fr re-asserted AFTER the base 2-col rule (the bug was order).
{
  const base = css.indexOf(".pipe-list { list-style: none;");
  const re = css.indexOf("@media (max-width: 640px) { .pipe-list { grid-template-columns: 1fr; } }");
  check("pipe-list: base is 2-col", css.includes("grid-template-columns: 1fr 1fr; gap: 12px 20px;"));
  check("pipe-list: 640px 1fr rule exists after the base rule", base > -1 && re > base,
    `base@${base} reassert@${re}`);
}
// A2. mini-tag wraps at <=640px, after the base rule.
{
  const base = css.indexOf(".mini-tag { margin-left: auto;");
  const re = css.indexOf("@media (max-width: 640px) { .mini-tag { white-space: normal; text-align: right; } }");
  check("mini-tag: base is nowrap", css.includes(".mini-tag { margin-left: auto;") && css.includes("white-space: nowrap;"));
  check("mini-tag: 640px wrap rule exists after the base rule", base > -1 && re > base,
    `base@${base} wrap@${re}`);
}
// A3. stacked-cards table block.
check("tables: thead hidden at <=640px",
  /@media \(max-width: 640px\) \{[\s\S]*?table\.compare thead \{ display: none; \}/.test(css));
check("tables: rows/cells become blocks at <=640px",
  css.includes("table.compare, table.compare tbody, table.compare tr, table.compare td { display: block; width: auto; }"));
check("tables: data-label shown via ::before",
  css.includes("table.compare td[data-label]::before { content: attr(data-label);"));
check("tables: first cell styled as card heading",
  css.includes("table.compare td:first-child { font-size: 16px; font-weight: 700;"));
// A4. data-labels: every value cell labelled with its exact thead text.
for (const f of ["pricing.html", "privacy.html", "features.html"]) {
  const html = read(f);
  const thead = html.match(/<thead>([\s\S]*?)<\/thead>/);
  const headers = [...thead[1].matchAll(/<th[^>]*>(.*?)<\/th>/g)].map((m) => m[1].trim());
  const rows = [...html.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)]
    .flatMap((m) => [...m[1].matchAll(/<tr>(.*?)<\/tr>/g)].map((r) => r[1]));
  let ok = rows.length > 0;
  for (const row of rows) {
    const cells = [...row.matchAll(/<td([^>]*)>/g)].map((m) => m[1]);
    if (cells.length !== headers.length) { ok = false; break; }
    if (cells[0].includes("data-label")) { ok = false; break; }
    for (let i = 1; i < cells.length; i++) {
      if (!cells[i].includes(`data-label="${headers[i]}"`)) { ok = false; break; }
    }
    if (!ok) break;
  }
  check(`data-labels: ${f} (${rows.length} rows, headers: ${headers.join(" | ")})`, ok);
}
// A5. teaser divider.
check("teaser: divider between stacked plans at <=640px",
  css.includes("@media (max-width: 640px) { .teaser-plan + .teaser-plan { border-top: 1px solid var(--border); padding-top: 24px; } }"));
// A6. sticky bar: single-button rule at <=480px + reserve 96px, no 132px left.
check("sticky: secondary hidden at <=480px",
  css.includes("@media (max-width: 480px) {") && css.includes(".sticky-cta .btn-secondary { display: none; }"));
check("sticky: primary flexes full-width at <=480px",
  css.includes(".sticky-cta .btn-primary { flex: 1 1 auto; }"));
check("sticky: bottom reserve is 96px everywhere (no 132px left)", !css.includes("132px"));
// A7. nav-toggle touch target. Step 9: 14px is off-scale, standardised to
// 16px — the target is still ~44px (12px + 16px text + 12px + 2px border).
check("nav-toggle: padding 12px 16px (~44px target)",
  css.includes("padding: 12px 16px; font-size: 16px; cursor: pointer;"));
// A8. sticky bar buttons still carry the classes the <=480px rule needs.
// Download.html has no sticky bar by design (it IS the download page).
for (const p of PAGES) {
  const html = read(p);
  const hasBar = html.includes('id="sticky-cta"');
  if (p === "download.html") {
    check("sticky bar: download.html has none by design", !hasBar);
  } else {
    check(`sticky bar classes: ${p}`, hasBar &&
      html.includes('class="btn btn-primary btn-small" href="demo.html"') &&
      html.includes('class="btn btn-secondary btn-small" href="download.html"'));
  }
}

// ---------- B. Regression smoke (Step 5 invariants) ----------
for (const p of PAGES) {
  check(`cta reframe: ${p} offers the live demo`, read(p).includes("Try the live demo"));
}
check("kbd: no orphaned period after </kbd> anywhere",
  !PAGES.some((p) => read(p).includes("</kbd>.")));
check("skeleton: solid base #2a3547 intact", css.includes("#2a3547"));
check("sticky: text hidden at <=900px", css.includes("@media (max-width: 900px) {\n  .sticky-cta-text { display: none; }"));
check("dataflow: stacks at <=1024px", css.includes("@media (max-width: 1024px) {\n  .dataflow { flex-direction: column; }"));
check("finder: 4th question pf-prep present",
  read("pricing.html").includes("pf-prep") && read("app.js").includes("pf-prep"));
{
  const ld = PAGES.map((p) => {
    const m = read(p).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    return m ? m[1] : null;
  });
  check("json-ld: identical on all 10 pages", ld.every((t) => t && t === ld[0]));
}
{
  const FUNNEL = {"pricing.html": "download.html", "download.html": "platforms.html",
    "platforms.html": "privacy.html", "privacy.html": "terms.html",
    "terms.html": "support.html", "support.html": "demo.html",
    "demo.html": "pricing.html", "features.html": "how-it-works.html",
    "how-it-works.html": "demo.html", "index.html": "demo.html"};
  for (const [p, nxt] of Object.entries(FUNNEL)) {
    const m = read(p).match(/<section class="next-band"[\s\S]*?<\/section>/);
    check(`funnel: ${p} -> ${nxt}`, !!m && m[0].includes(`href="${nxt}"`));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
