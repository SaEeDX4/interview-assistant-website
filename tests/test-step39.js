/* Step 39 — full-site UI review fixes (owner's 8-hour mandate):
   card-row stretch family, terms divider, stacked roadmap thread,
   support CTA gap, skip-link sliver, Arabic letter-spacing,
   demo placeholder truncation. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const css = read("website/styles.css").replace(/\/\*[\s\S]*?\*\//g, "");
const features = read("website/features.html");
const support = read("website/support.html");
const demo = read("website/demo.html");
const index = read("website/index.html");

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

/* Step 55 annotation: the .trouble-grid clause left this check
   with the troubleshooting cards themselves — the owner-ordered
   support UX redesign removed that component (its substance
   lives in the assistant's procedures now), so the stretch
   family is pinned on the grids that remain. */
check("card grids stretch by default (ragged-bottom family)",
  /\.grid \{ display: grid; gap: 20px; align-items: stretch; \}/.test(css) &&
  /\.two-col \{[^}]*align-items: start/.test(css));
check("terms: the h2 after the summary card keeps its divider",
  /\.doc \.doc-summary \+ h2 \{ border-top: 1px solid var\(--border\); padding-top: 28px; margin-top: 32px; \}/.test(css));
check("stacked roadmap keeps its thread (segment per node, text padded clear)",
  /@media \(max-width: 860px\) \{[\s\S]*?\.roadmap-node \{ padding-top: 0; padding-left: 48px; \}[\s\S]*?\.roadmap-node:not\(:last-child\)::after \{[^}]*left: 13px;[^}]*height: calc\(100% \+ 28px\)/.test(css));
check("support runbook CTAs use the standard cta-row (12px gap)",
  support.includes('<p class="cta-row"><a class="btn btn-primary" href="demo.html">Try the demo</a>'));
check("skip link parks fully out of view (no 2px sliver)",
  /\.skip-link \{[^}]*top: -96px/.test(css) &&
  /\.skip-link:focus \{ top: 12px; \}/.test(css));
check("Arabic-script content never letter-spaced (joining preserved)",
  /\[lang="fa"\], \[lang="ar"\] \{ letter-spacing: 0; \}/.test(css) &&
  features.includes('<span lang="fa">فارسی</span>') &&
  features.includes('<span lang="ar">العربية</span>') &&
  features.includes('Answer · Persian — <span lang="fa">فارسی</span>'));
check("demo placeholder fits the input at phone widths",
  demo.includes('placeholder="Type your own question…"') &&
  index.includes('placeholder="Type your own question…"') &&
  !demo.includes("Type a question, or pick a sample below") &&
  !index.includes("Type a question, or pick a sample below"));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
