/* Step 16 — imagery standard. Run: node tests/test-step16.js
   (from ~/workspace/interview-assistant-website).
   The standard (IMAGERY.md): og-image is exactly 1200x630 PNG under
   200KB; favicon is the 64x64 SVG mark; no <img> tags and no photo
   backgrounds anywhere — every in-page visual is a CSS mockup, which is
   the honest choice while the app has no published screenshots. The Step
   16 audit found no violations, so there is no fix script — this test
   locks in what the audit found. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "pricing.html", "download.html", "platforms.html", "privacy.html",
  "terms.html", "support.html", "404.html"];
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// 1. og-image: 1200x630 PNG, under 200KB.
const og = fs.readFileSync(path.join(root, "og-image.png"));
const isPng = og.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const width = og.readUInt32BE(16), height = og.readUInt32BE(20);
check("og-image.png is a 1200x630 PNG under 200KB",
  isPng && width === 1200 && height === 630 && og.length < 200 * 1024,
  `${width}x${height}, ${Math.round(og.length / 1024)}KB`);

// 2. favicon: SVG with the IA mark.
const fav = fs.readFileSync(path.join(root, "favicon.svg"), "utf8");
check("favicon.svg is the 64x64 accent mark with dark IA",
  fav.includes('viewBox="0 0 64 64"') && fav.includes('fill="#7c6cff"')
  && fav.includes('fill="#0a0c10"') && fav.includes(">IA<"));

// 3. No <img> tags, no photo backgrounds.
let imgOk = true, imgNotes = [];
for (const f of PAGES) {
  const h = fs.readFileSync(path.join(root, f), "utf8");
  if (/<img[\s>]/.test(h)) { imgOk = false; imgNotes.push(`${f}: has <img>`); }
  if (!h.includes('<link rel="icon"')) { imgOk = false; imgNotes.push(`${f}: no favicon link`); }
  if (!h.includes("og-image.png")) { imgOk = false; imgNotes.push(`${f}: no og:image`); }
}
check("no <img> tags; every page links the favicon and the og-image",
  imgOk, imgNotes.join(" | "));
const photoBg = [...css.matchAll(/background-image:\s*url\(/g)];
const gradientBg = [...css.matchAll(/background-image:\s*linear-gradient\(/g)];
check("background-image is gradients only (no photo URLs)",
  photoBg.length === 0 && gradientBg.length >= 1,
  `url( backgrounds: ${photoBg.length}`);

// 4. Regressions (only steps whose fixes are applied).
check("step11: btn-small padding 12px (44px target) still present",
  /\.btn-small\s*\{\s*padding:\s*12px 16px;\s*font-size:\s*15px;\s*\}/.test(css));
check("step10: no unloaded weights (650/750) reintroduced",
  !/font-weight:\s*650/.test(css) && !/font-weight:\s*750/.test(css) && !/font:\s*650\s/.test(css));
check("step9: hero->content 48px still present",
  /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
