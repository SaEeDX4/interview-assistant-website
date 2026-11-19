/* Step 13 — SEO, sitemap + 404. Run: node tests/test-step13.js
   (from ~/workspace/interview-assistant-website).
   The standard (SEO.md): sitemap.xml + robots.txt + 404.html exist;
   every page has a unique title, a 50-160 char description, canonical,
   og:url, theme-color, full OG/Twitter tags and JSON-LD with url;
   every internal link and anchor resolves. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const BASE = "https://cybervalida.online/";
const PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "pricing.html", "download.html", "platforms.html", "privacy.html",
  "terms.html", "support.html"];
const html = {};
for (const f of [...PAGES, "404.html"]) html[f] = fs.readFileSync(path.join(root, f), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// 1. Sitemap.
let sitemapOk = true, sitemapNotes = [];
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) { sitemapOk = false; sitemapNotes.push("bad xml declaration"); }
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length !== 10) { sitemapOk = false; sitemapNotes.push(`${locs.length} locs, want 10`); }
for (const loc of locs) {
  if (!loc.startsWith(BASE)) { sitemapOk = false; sitemapNotes.push(`${loc}: wrong base`); continue; }
  const file = loc.slice(BASE.length) || "index.html";
  if (!fs.existsSync(path.join(root, file))) { sitemapOk = false; sitemapNotes.push(`${loc}: no such file`); }
}
if (locs.some((l) => l.includes("404"))) { sitemapOk = false; sitemapNotes.push("404 listed"); }
if ((sitemap.match(/<lastmod>/g) || []).length !== 10) { sitemapOk = false; sitemapNotes.push("lastmod missing"); }
check("sitemap.xml: 10 pages, absolute URLs, all files exist, no 404",
  sitemapOk, sitemapNotes.join(" | "));

// 2. Robots.
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
check("robots.txt allows all and points at the sitemap",
  /User-agent: \*/.test(robots) && /Allow: \//.test(robots)
  && robots.includes(`Sitemap: ${BASE}sitemap.xml`));

// 3. 404 page.
const e404 = html["404.html"];
check("404.html: noindex, skip-link, header, main#main, footer, no aria-current, no JSON-LD",
  e404.includes('<meta name="robots" content="noindex">')
  && e404.includes('class="skip-link"') && e404.includes("<header")
  && e404.includes('<main id="main"') && e404.includes("<footer")
  && !e404.includes("aria-current") && !e404.includes("ld+json")
  && e404.includes('href="index.html"') && e404.includes('href="demo.html"')
  && e404.includes('href="support.html"'));

// 4. Per-page head.
const titles = new Set(), descs = new Set();
let headOk = true, headNotes = [];
for (const f of PAGES) {
  const h = html[f];
  const url = BASE + (f === "index.html" ? "" : f);
  const title = (h.match(/<title>([^<]+)<\/title>/) || [])[1];
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) { headOk = false; headNotes.push(`${f}: no title`); }
  else if (titles.has(title)) { headOk = false; headNotes.push(`${f}: duplicate title`); }
  else titles.add(title);
  if (!desc || desc.length < 50 || desc.length > 160) { headOk = false; headNotes.push(`${f}: description ${desc ? desc.length : 0} chars`); }
  else if (descs.has(desc)) { headOk = false; headNotes.push(`${f}: duplicate description`); }
  else descs.add(desc);
  if (!h.includes(`<link rel="canonical" href="${url}">`)) { headOk = false; headNotes.push(`${f}: no canonical`); }
  if (!h.includes(`<meta property="og:url" content="${url}">`)) { headOk = false; headNotes.push(`${f}: no og:url`); }
  if (!h.includes('<meta name="theme-color" content="#0a0c10">')) { headOk = false; headNotes.push(`${f}: no theme-color`); }
  for (const tag of ["og:title", "og:description", "og:type", "og:image"]) {
    if (!h.includes(`property="${tag}"`)) { headOk = false; headNotes.push(`${f}: no ${tag}`); }
  }
  const ogDesc = (h.match(/<meta property="og:description" content="([^"]*)"/) || [])[1];
  if (!ogDesc || ogDesc.length > 160) { headOk = false; headNotes.push(`${f}: og:description ${ogDesc ? ogDesc.length : 0} chars`); }
  if (!h.includes('<meta name="twitter:card" content="summary_large_image">')) { headOk = false; headNotes.push(`${f}: no twitter:card`); }
  if (!h.includes('<meta name="twitter:image"')) { headOk = false; headNotes.push(`${f}: no twitter:image`); }
  const ld = (h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  if (!ld || !ld.includes(`"url": "${BASE}"`) || !ld.includes('"name": "Trial"') || !ld.includes('"name": "Pro"')) {
    headOk = false; headNotes.push(`${f}: JSON-LD missing url/offers`);
  }
}
check("every page: unique title, 50-160 char description, canonical, og:url, theme-color, OG/Twitter, JSON-LD with url",
  headOk, headNotes.join(" | "));
check("platforms og:description does not overstate readiness",
  !html["platforms.html"].includes("Windows now."));

// 5. Internal links resolve.
const idsByFile = {};
for (const f of [...PAGES, "404.html"]) {
  idsByFile[f] = new Set([...html[f].matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
}
let linksOk = true, linksNotes = [];
for (const f of [...PAGES, "404.html"]) {
  for (const m of html[f].matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(href) || href === "") continue;
    const [filePart, anchor] = href.split("#");
    /* Step 57 annotation: internal links may now carry a query
       string — the contextual help deep links (support.html?topic=…).
       The file check resolves the path only; the query is runtime
       state for the target page's module, not part of the file. */
    const file = filePart.split("?")[0];
    const target = file || f;
    if (!fs.existsSync(path.join(root, target))) { linksOk = false; linksNotes.push(`${f}: ${href} (no such file)`); continue; }
    if (anchor && !idsByFile[target].has(anchor)) { linksOk = false; linksNotes.push(`${f}: ${href} (no such id)`); }
  }
}
check("every internal link and anchor resolves",
  linksOk, linksNotes.join(" | "));

// 6. Regressions.
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
check("step11: btn-small padding 12px (44px target) still present",
  /\.btn-small\s*\{\s*padding:\s*12px 16px;\s*font-size:\s*15px;\s*\}/.test(css));
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(css) && !/font-weight:\s*750/.test(css) && !/font:\s*650\s/.test(css));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
