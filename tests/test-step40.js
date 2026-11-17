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
check("both AI paths capture their controller (no cross-request nulling)",
  (js.match(/var ctl = (fetchCtl|demoFetchCtl);/g) || []).length === 2 &&
  js.includes("if (fetchCtl === ctl) { fetchCtl = null; }") &&
  js.includes("if (demoFetchCtl === ctl) { demoFetchCtl = null; }") &&
  !js.includes("var timeout = fetchCtl ? setTimeout(function () { fetchCtl.abort(); }, 15000) : null;") &&
  !js.includes("var timeout = demoFetchCtl ? setTimeout(function () { demoFetchCtl.abort(); }, 15000) : null;"));
check(".visually-hidden has exactly one definition",
  (css.match(/\.visually-hidden[, ]/g) || []).length === 1 &&
  (css.match(/\.visually-hidden \{/g) || []).length === 0 &&
  css.includes(".visually-hidden, .demo-title-visually-hidden {"));
check(".doc-summary h2 carries no !important (source order suffices)",
  /\.doc-summary h2 \{ border: 0; padding: 0; margin: 0 0 8px; font-size: 18px; \}/.test(css));
check("no inline style attributes anywhere (design system is class-based)",
  pages.every((h) => !/ style="/.test(h)) &&
  demo.includes('<div class="grid grid-3 demo-modes">') &&
  /\.demo-modes \{ margin-top: 24px; \}/.test(css));
check("RTL detection regex uses the escaped range everywhere",
  !js.includes("/[؀-ۿ]/") &&
  (js.match(/\[\\u0600-\\u06FF\]/g) || []).length >= 2);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
