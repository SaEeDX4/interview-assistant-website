/* Step 18 — self-hosted Inter. Run: node tests/test-step18.js
   (from ~/workspace/interview-assistant-website).
   The standard (TYPOGRAPHY.md §3 + Step 18 audit entry): Inter is served
   from website/fonts/ as a variable font (weights 100-900, display swap),
   latin + latin-ext; no Google Fonts request anywhere; the latin file is
   preloaded on every page. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const repo = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

const pages = fs.readdirSync(root).filter((x) => x.endsWith(".html"));

// 1. No external font request anywhere.
let external = [];
for (const f of pages) {
  const html = fs.readFileSync(path.join(root, f), "utf8");
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) external.push(f);
}
if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(css)) external.push("styles.css");
check("no Google Fonts request in any page or stylesheet", external.length === 0, external.join(","));

// 2. @font-face blocks: variable range, display swap, local srcs, unicode-range.
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
const hasLatin = faces.some((b) => /src:\s*url\("fonts\/inter-latin\.woff2"\)/.test(b)
  && /font-weight:\s*100 900/.test(b) && /font-display:\s*swap/.test(b)
  && /unicode-range:[^;]*U\+0000-00FF/.test(b));
const hasLatinExt = faces.some((b) => /src:\s*url\("fonts\/inter-latin-ext\.woff2"\)/.test(b)
  && /font-weight:\s*100 900/.test(b) && /font-display:\s*swap/.test(b)
  && /unicode-range:[^;]*U\+0100-02BA/.test(b));
check("@font-face latin variable (100-900, swap, unicode-range)", hasLatin);
check("@font-face latin-ext variable (100-900, swap, unicode-range)", hasLatinExt);
check("no remote URL in any @font-face src", !faces.some((b) => /src:[^;]*https?:/.test(b)));

// 3. Font files exist and are real woff2.
let fontsOk = true, fontsNotes = [];
for (const f of ["inter-latin.woff2", "inter-latin-ext.woff2"]) {
  const p = path.join(root, "fonts", f);
  if (!fs.existsSync(p)) { fontsOk = false; fontsNotes.push(f + " missing"); continue; }
  const magic = fs.readFileSync(p).subarray(0, 4).toString("latin1");
  if (magic !== "wOF2") { fontsOk = false; fontsNotes.push(f + " bad magic " + JSON.stringify(magic)); }
}
check("font files exist in website/fonts/ and are valid woff2", fontsOk, fontsNotes.join(" | "));

// 4. Preload of the latin variable file on every page.
let noPreload = [];
for (const f of pages) {
  const html = fs.readFileSync(path.join(root, f), "utf8");
  if (!/<link rel="preload" href="fonts\/inter-latin\.woff2" as="font" type="font\/woff2" crossorigin>/.test(html)) noPreload.push(f);
}
check("latin variable font preloaded on every page", noPreload.length === 0, noPreload.join(","));

// 5. Body still uses Inter first, and the standard documents self-hosting.
check("body font stack still starts with Inter",
  /font:\s*400 17px\/1\.65 Inter,/.test(css));
const typo = fs.readFileSync(path.join(repo, "standards", "TYPOGRAPHY.md"), "utf8");
check("TYPOGRAPHY.md documents self-hosted Inter (Step 18)",
  /self-hosted as a variable font/.test(typo) && /Step 18/.test(typo));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
