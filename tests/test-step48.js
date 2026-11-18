#!/usr/bin/env node
/* Step 48 — Growth & Campaigns website integration (static checks).
   The site renders announcements from the release Worker's public
   /growth document into declared slots; promotions and prices are
   never part of that document (ADR G4), so the static floor of
   every page must stay exactly as authored when the document is
   empty or unreachable. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS " + name); }
  else { failed++; console.log("FAIL " + name); }
}

const appJs = read("website/app.js");
const start = appJs.indexOf("/* Step 48 — Growth & Campaigns");
const end = appJs.indexOf("/* Step 41 — download page");
check("growth module exists in app.js before the download module", start > 0 && end > start);
const mod = appJs.slice(start, end);
check("module reads the public /growth endpoint",
  mod.includes("admin.cybervalida.online/growth"));
check("module renders with textContent (no data-driven innerHTML)",
  mod.includes("textContent") && !/innerHTML\s*=\s*[^"']/.test(mod.replace(/innerHTML = ""/g, "")));
check("module validates https-only links", mod.includes("/^https:\\/\\//"));
check("module validates ISO country scopes", mod.includes("/^[A-Z]{2}$/"));
check("module caps headline/body/label lengths", mod.includes("140") && mod.includes("500"));
check("module persists dismissals per announcement id", mod.includes("ia_growth_dismissed"));
check("module fails safe to the static page on fetch errors", mod.includes("honest floor"));

const pages = fs.readdirSync(path.join(ROOT, "website")).filter((f) => f.endsWith(".html"));
check("every page declares the bar slot",
  pages.length === 11 && pages.every((p) => read("website/" + p).includes('id="ia-growth-bar"')));
const index = read("website/index.html");
check("homepage declares the update-card slot",
  index.includes('id="ia-growth-home"') && index.includes('id="ia-growth-home-inner"'));
const pricing = read("website/pricing.html");
check("pricing page declares the callout slot", pricing.includes('id="ia-growth-pricing"'));
check("the home slot does not carry .section while hidden (adjacency regression guard)",
  index.includes('id="ia-growth-home" hidden') && !index.includes('class="section" id="ia-growth-home"'));
check("the loader grants .section to the home slot only when it renders",
  appJs.includes('home.classList.add("section")'));
check("slots start hidden (static floor is the authored page)",
  index.includes('id="ia-growth-home" hidden') && pricing.includes('id="ia-growth-pricing" hidden'));

const css = read("website/styles.css");
check("hidden slots are display:none", css.includes("#ia-growth-bar[hidden]"));
check("growth CSS adds no capsule radii", !/ia-(bar|dismiss|update|callout)[^{]*\{[^}]*999px/.test(css));
check("dismiss control uses the 8px small-control radius",
  /\.ia-dismiss \{[^}]*border-radius: 8px;/.test(css));

console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
