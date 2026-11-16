#!/usr/bin/env node
/* Step 32 — navigation, menu and footer, rebuilt from the study of
   Apple / Google / Microsoft / Tesla (standards/NAVIGATION.md):
   - header order: the funnel left to right (Features, How it
     works, Demo, Pricing, Download), Support last, legal out of
     the header, one filled CTA at the far right;
   - the toggle is two bars that morph into an × (aria-expanded is
     the state), never a text glyph;
   - the mobile menu is a full-screen overlay in the header's
     material: funnel order + Platforms restored, links rising with
     a 40ms stagger on open only, a pinned foot (full-width CTA +
     quiet Privacy · Terms), scroll locked while open, Escape
     closes and returns focus;
   - the footer: the one-link Legal column is dissolved — legal
     lives in the bottom bar (© sentence, Billing link, the
     "Made for candidates" identity slot). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "website", "app.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "pricing.html", "download.html", "platforms.html", "privacy.html",
  "terms.html", "support.html", "404.html"];
const htmls = PAGES.map((f) => fs.readFileSync(path.join(ROOT, "website", f), "utf8"));
const html = htmls[0];
const navOf = (h) => (h.match(/<nav id="site-nav"[\s\S]*?<\/nav>/) || [""])[0];
const footOf = (h) => (h.match(/<footer class="site-footer">[\s\S]*?<\/footer>/) || [""])[0];

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

/* ---------- header + nav order, on every page ---------- */
check("the toggle is two bars, and the old text glyph is gone everywhere",
  htmls.every((h) => /<span class="nav-toggle-bars" aria-hidden="true"><span><\/span><span><\/span><\/span>/.test(h)) &&
  htmls.every((h) => !h.includes("☰")));
const ORDER = ["features.html", "how-it-works.html", "demo.html", "pricing.html",
  "download.html", "platforms.html", "support.html"];
check("nav order is the funnel, Support last, on every page",
  htmls.every((h) => {
    const nav = navOf(h);
    const idx = ORDER.map((x) => nav.indexOf('href="' + x + '"'));
    return idx.every((v) => v >= 0) && idx.every((v, i) => i === 0 || v > idx[i - 1]);
  }));
check("Platforms is the mobile-only restore; Privacy is only in the menu's legal row",
  htmls.every((h) => /<a href="platforms\.html" class="nav-mobile-only"/.test(navOf(h))) &&
  htmls.every((h) => (navOf(h).match(/href="privacy\.html"/g) || []).length === 1) &&
  htmls.every((h) => /<span class="nav-menu-legal">\s*<a href="privacy\.html"/.test(navOf(h))));
check("the menu foot carries the full-width CTA and the legal row",
  htmls.every((h) => /<a class="btn btn-primary nav-menu-cta" href="demo\.html">Try the live demo<\/a>/.test(navOf(h))) &&
  htmls.every((h) => /<a href="terms\.html"( aria-current="page")?>Terms \(draft\)<\/a>/.test(navOf(h))));
check("exactly one header CTA button, at the far right of the bar",
  htmls.every((h) => {
    const head = (h.match(/<header class="site-header">[\s\S]*?<\/header>/) || [""])[0];
    return (head.match(/class="btn btn-primary btn-small" href="demo\.html"/g) || []).length === 1;
  }));

/* ---------- the morph + the overlay ---------- */
check("the bars morph into an × off aria-expanded (300ms, standard curve)",
  /\.nav-toggle-bars span \{[^}]*transition: transform \.3s cubic-bezier\(\.2,\.7,\.3,1\)/.test(clean) &&
  /\.nav-toggle\[aria-expanded="true"\] \.nav-toggle-bars span:first-child \{ transform: translateY\(5px\) rotate\(45deg\); \}/.test(clean) &&
  /\.nav-toggle\[aria-expanded="true"\] \.nav-toggle-bars span:last-child \{ transform: translateY\(-5px\) rotate\(-45deg\); \}/.test(clean) &&
  /\.nav-toggle \{[^}]*width: 44px; height: 44px;/.test(clean));
check("the panel is an under-bar overlay in the header's material, shown by visibility + opacity",
  /\.site-nav \{\s*position: absolute; top: 64px;[^}]*height: calc\(100dvh - 64px\);/.test(clean) &&
  /background: rgba\(10, 12, 16, \.92\);/.test(clean) &&
  /\.site-nav \{[^}]*opacity: 0; visibility: hidden;/.test(clean) &&
  /\.site-nav\.is-open \{ opacity: 1; visibility: visible;/.test(clean));
check("links rise with a 40ms stagger that exists only under .is-open; the foot fades last",
  /\.site-nav\.is-open > a:nth-child\(2\) \{ transition-delay: \.04s; \}/.test(clean) &&
  /\.site-nav\.is-open > a:nth-child\(7\) \{ transition-delay: \.24s; \}/.test(clean) &&
  /\.site-nav\.is-open > a:nth-child\(8\) \{ transition-delay: \.28s; \}/.test(clean) &&
  /\.site-nav\.is-open \.nav-menu-foot \{ opacity: 1; transition-delay: \.32s; \}/.test(clean) &&
  !/\.site-nav > a:nth-child\(\d\) \{ transition-delay/.test(clean));
check("panel links are 24px; the current page is accent in the open menu; scroll locks only at ≤1024px",
  /\.site-nav > a \{ font-size: 24px; padding: 16px 4px;/.test(clean) &&
  /\.site-nav\.is-open a\[aria-current="page"\] \{ color: var\(--accent-light\); \}/.test(clean) &&
  /body\.menu-open \{ overflow: hidden; \}/.test(clean) &&
  /\.nav-mobile-only \{ display: none; \}/.test(clean) &&
  /\.nav-menu-foot \{ display: none; \}/.test(clean));

/* ---------- the JS contract ---------- */
const navJs = (js.split("/* Mobile nav.")[1] || "").split("/* Step 21")[0];
check("one setOpen drives panel, morph state and scroll lock; Escape closes and refocuses the toggle",
  /function setOpen\(open\)/.test(navJs) &&
  /nav\.classList\.toggle\("is-open", open\)/.test(navJs) &&
  /toggle\.setAttribute\("aria-expanded", String\(open\)\)/.test(navJs) &&
  /document\.body\.classList\.toggle\("menu-open", open\)/.test(navJs) &&
  /e\.key === "Escape" && nav\.classList\.contains\("is-open"\)/.test(navJs) &&
  /toggle\.focus\(\)/.test(navJs));

/* ---------- the footer ---------- */
check("no Legal column anywhere; the footer grid is brand + Product + Resources",
  htmls.every((h) => !/<h3>Legal<\/h3>/.test(footOf(h))) &&
  /\.footer-grid \{ display: grid; grid-template-columns: 2fr 1fr 1fr;/.test(clean) &&
  htmls.every((h) => /<h3>Product<\/h3>/.test(footOf(h)) && /<h3>Resources<\/h3>/.test(footOf(h))));
check("legal lives in the bottom bar: © sentence, then Billing, then the identity line",
  htmls.every((h) => {
    const foot = footOf(h);
    const copy = foot.indexOf("© 2026 Interview Assistant.");
    const bill = foot.indexOf("Billing — via Paddle");
    const made = foot.indexOf("Made for candidates, in 10 languages.");
    return copy >= 0 && bill > copy && made > bill &&
      /<div class="footer-bottom-right">\s*<a href="support\.html#faq-b9">Billing — via Paddle<\/a>/.test(foot);
  }));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
