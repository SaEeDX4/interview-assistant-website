#!/usr/bin/env node
/* Step 36 — the Home question, settled by research (nine of nine
   brands carry no explicit Home link; NN/g still recommends an
   explicit link somewhere in the global nav; the controlled
   data shows ~83% logo-only vs >=98% with one). Adopted: no
   Home in the desktop header (it would duplicate the adjacent
   logo); "Home" is the mobile menu's first item; the header
   brand's hit area is 44px tall; the footer brand is a home
   link. See standards/NAVIGATION.md, Step 36 audit. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "pricing.html", "download.html", "platforms.html", "privacy.html",
  "terms.html", "support.html", "404.html"];
const htmls = PAGES.map((f) => fs.readFileSync(path.join(ROOT, "website", f), "utf8"));

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}
function navOf(h) {
  const m = h.match(/<nav id="site-nav"[\s\S]*?<\/nav>/);
  return m ? m[0] : "";
}

check("Home is the mobile menu's first item on every page (mobile-only class)",
  htmls.every((h) => /<a href="index\.html" class="nav-mobile-only"( aria-current="page")?>Home<\/a>\s*<a href="features\.html"/.test(navOf(h))));
check("Home carries aria-current only on the homepage itself",
  htmls.every((h, i) => (navOf(h).includes('<a href="index.html" class="nav-mobile-only" aria-current="page">Home</a>') === (PAGES[i] === "index.html"))));
check("the header brand's hit area is 48px tall (8px on-scale padding on the 32px mark)",
  /\.site-header \.brand \{ padding-top: 8px; padding-bottom: 8px; \}/.test(clean));
check("the footer brand is a home link on every page",
  htmls.every((h) => /<a class="brand" href="index\.html" aria-label="Interview Assistant — home"/.test(h)) &&
  htmls.every((h) => !/<p class="brand">/.test(h)));
check("the menu stagger covers the eighth link and the foot moved to .32s",
  /\.site-nav\.is-open > a:nth-child\(8\) \{ transition-delay: \.28s; \}/.test(clean) &&
  /\.site-nav\.is-open \.nav-menu-foot \{ opacity: 1; transition-delay: \.32s; \}/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
