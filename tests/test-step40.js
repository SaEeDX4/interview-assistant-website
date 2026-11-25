/* Step 40 — whole-repo review, code batch: the four defects from the
   code audit (hero fetch guard, AbortController race in both AI
   paths, duplicate .visually-hidden, the site's only inline style)
   plus the standardised RTL regex. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const css = read("website/styles.css").replace(/\/\*[\s\S]*?\*\//g, "");
const js = read("website/app.js");
const demo = read("website/demo.html");
const pages = ["index", "features", "how-it-works", "demo", "pricing",
  "download", "platforms", "privacy", "terms", "support", "404"]
  .map((n) => read("website/" + n + ".html"));

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

check("hero AI path guards a missing fetch (guidance fallback, no throw)",
  js.includes('if (typeof fetch !== "function") { prepareFallback();'));
check("both AI paths share one request core that captures its controller (no cross-request nulling)",
  (js.match(/fetch\(IA_AI_ENDPOINT, \{/g) || []).length === 1 &&
  (js.match(/iaFetchAI\(/g) || []).length === 3 &&
  js.includes("var ctl = (\"AbortController\" in window) ? new AbortController() : null;") &&
  js.includes("if (getHandle() === ctl) { setHandle(null); }") &&
  js.includes("var onTimeout = function () { ctl.abort(); };") &&
  js.includes("var timeout = ctl ? setTimeout(onTimeout, 15000) : null;") &&
  !js.includes("var timeout = fetchCtl ? setTimeout(function () { fetchCtl.abort(); }, 15000) : null;") &&
  !js.includes("var timeout = demoFetchCtl ? setTimeout(function () { demoFetchCtl.abort(); }, 15000) : null;"));
check(".visually-hidden has exactly one definition",
  (css.match(/\.visually-hidden[, ]/g) || []).length === 1 &&
  (css.match(/\.visually-hidden \{/g) || []).length === 0 &&
  css.includes(".visually-hidden, .demo-title-visually-hidden {"));
/* Step 93 re-pin: .doc-summary was retired with the draft terms page.
   The check's contract — the summary layer's heading needs no
   !important because source order suffices — now seats on the "How to
   read" intro panel's heading rule, pinned exactly, with the retired
   rule asserted gone. */
check("terms intro heading carries no !important (source order suffices)",
  /\.doc-intro h2 \{ border: 0; padding: 0; margin: 0 0 8px; font-size: 18px; \}/.test(css) &&
  !/\.doc-summary h2/.test(css));
check("no inline style attributes anywhere (design system is class-based)",
  pages.every((h) => !/ style="/.test(h)) &&
  demo.includes('<div class="grid grid-3 demo-modes">') &&
  /\.demo-modes \{ margin-top: 24px; \}/.test(css));
check("RTL detection regex uses the escaped range everywhere",
  !js.includes("/[؀-ۿ]/") &&
  (js.match(/\[\\u0600-\\u06FF\]/g) || []).length >= 2);

/* Docs batch (Step 40 inventory audit): README accuracy. */
const readme = read("README.md");
const testsReadme = read("tests/README.md");
const sums = read("SHA256SUMS.txt");
const crypto = require("crypto");
check("README names all 14 standards and the current suite range",
  readme.includes("14 documents") && readme.includes("navigation, radius, stability, releases") &&
  readme.includes("`test-step6.js` … `test-step41.js`") &&
  !readme.includes("195 checks total") && !readme.includes("The review's latest results"));
check("tests/README explains the numbering gaps and the sims",
  testsReadme.includes("Step 31") && testsReadme.includes("rolled back") &&
  testsReadme.includes("sim-step30-hero.js") && testsReadme.includes("reverify*.py") &&
  !testsReadme.includes("The latest full-review results"));
check("SHA256SUMS row for README.md matches the file itself",
  sums.includes(crypto.createHash("sha256").update(read("README.md")).digest("hex") + "  README.md"));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
