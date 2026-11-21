/* Step 17 — dead-code & consistency. Run: node tests/test-step17.js
   (from ~/workspace/interview-assistant-website).
   The standard (DEADCODE.md): every CSS class is used in HTML, referenced
   by app.js, or whitelisted; every HTML class is defined or whitelisted;
   nav/footer byte-identical on all pages; funnel on every content page;
   sticky bar everywhere except download + 404 (by design). */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "pricing.html", "download.html", "platforms.html", "privacy.html",
  "terms.html", "support.html", "404.html"];
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = {};
for (const f of PAGES) html[f] = fs.readFileSync(path.join(root, f), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// Whitelist (DEADCODE.md D3): JS state, JS-generated, semantic hooks.
const WHITELIST = new Set(["cta-visible", "is-coach-active", "is-new", "is-open",
  "is-scrolled", "is-visible", "js", "js-acc", "open",
  "reveal", "coach", "coach-keys", "calc-note", "pricing",
  "brand-name", "hero-copy",
  /* Step 75: avatar.js state classes (the census reads app.js only;
     has-avatar / is-static are set by the avatar driver at runtime). */
  "has-avatar", "is-static"]);

// 1. Census: every CSS class is used, referenced by JS, or whitelisted.
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
// Step 18: url(...) values are not selectors — ".woff2" in a font URL is not a class.
const noUrls = clean.replace(/url\([^)]*\)/g, "");
const defined = new Set([...noUrls.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1]));
const used = new Set();
for (const f of PAGES) {
  for (const m of html[f].matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  }
}
const dead = [...defined].filter((c) => !used.has(c) && !js.includes(c) && !WHITELIST.has(c));
check("every CSS class is used in HTML, referenced by JS, or whitelisted",
  dead.length === 0, `dead: ${dead.sort().join(", ")}`);

// 2. Reverse census: every HTML class is defined or whitelisted.
const undefinedCls = [...used].filter((c) => !defined.has(c) && !WHITELIST.has(c));
check("every HTML class is defined in CSS or whitelisted",
  undefinedCls.length === 0, `undefined: ${undefinedCls.sort().join(", ")}`);

// 3. Nav + footer identical on all pages (modulo aria-current).
// Step 73 annotation: demo.html's menu CTA deliberately points to
// download.html — a "Try the live demo" button on the demo page
// itself would be a self-link. Identity is therefore asserted
// exactly for the other ten pages, and for demo.html after swapping
// that one CTA back to the standard form (nothing else may differ).
function norm(s) { return s.replace(/ aria-current="page"/g, ""); }
const navOfPage = (f) => norm((html[f].match(/<nav[^>]*>[\s\S]*?<\/nav>/) || [""])[0]);
const navs = new Set(PAGES.filter((f) => f !== "demo.html").map(navOfPage));
const demoNavSwapped = navOfPage("demo.html").replace(
  '<a class="btn btn-primary nav-menu-cta" href="download.html">Download for Windows</a>',
  '<a class="btn btn-primary nav-menu-cta" href="demo.html">Try the live demo</a>');
const foots = new Set(PAGES.map((f) => norm((html[f].match(/<footer[^>]*>[\s\S]*?<\/footer>/) || [""])[0])));
check("nav markup identical on all 11 pages (Step 73: modulo demo.html's CTA target)",
  navs.size === 1 && demoNavSwapped === [...navs][0], `${navs.size} variants`);
check("footer markup identical on all 11 pages", foots.size === 1, `${foots.size} variants`);

// 4. Funnel + sticky bar placement.
const contentPages = PAGES.filter((f) => f !== "404.html");
check("next-step band on all 10 content pages",
  contentPages.every((f) => html[f].includes("next-band")));
check("sticky bar on all content pages except download (by design)",
  contentPages.filter((f) => f !== "download.html").every((f) => html[f].includes('id="sticky-cta"'))
  && !html["download.html"].includes('id="sticky-cta"')
  && !html["404.html"].includes('id="sticky-cta"'));
check("app.js guards the missing sticky bar",
  /var bar = document\.getElementById\("sticky-cta"\);\s*if \(!bar\) \{ return; \}/.test(js));

// 5. Regressions (only steps whose fixes are applied).
check("step11: btn-small padding 12px (44px target) still present",
  /\.btn-small\s*\{\s*padding:\s*12px 16px;\s*font-size:\s*15px;\s*\}/.test(clean));
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(clean) && !/font-weight:\s*750/.test(clean) && !/font:\s*650\s/.test(clean));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
