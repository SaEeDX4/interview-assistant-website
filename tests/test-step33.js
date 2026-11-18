#!/usr/bin/env node
/* Step 33 — the line under the hero CTAs, rebuilt from the
   hero-microcopy study of nine brands
   (~/workspace/step33-hero-microcopy-research.md):
   - one register only: the offer. The ethics sentence ("Use only
     where you are allowed to.") never sits under the CTAs — it
     keeps its proper homes, the privacy strip and the footer;
   - the minutes are framed generously and truthfully: free, and
     they never expire (the Trial's 30 minutes are lifetime,
     docs/05-PRICING-BILLING.md). No unverified claims: no
     "no credit card required" until the trial flow is confirmed
     at launch, no "free forever", no "cancel anytime";
   - one line at 390px: the text is short enough (46 chars) to
     hold a single line at the phone width;
   - the spacing nit from the same audit: the line ends the copy
     column, so its bottom margin is 0 and the grid gap (32px)
     alone separates it from the window (was 16 + 32 = 48px). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(ROOT, "website", "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const html = fs.readFileSync(path.join(ROOT, "website", "index.html"), "utf8");
const privacy = fs.readFileSync(path.join(ROOT, "website", "privacy.html"), "utf8");
const hero = (html.split('<section class="hero"')[1] || "").split("</section>")[0];

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS " + name); }
  else { fail++; console.log("FAIL " + name); }
}

check("the trust line is the status-only sentence (Step 51 copy pass)",
  /<p class="trust-line">Not released yet — this demo is a simulation\.<\/p>/.test(hero));
check("the old mixed line is gone from the hero",
  !hero.includes("30 live minutes free") &&
  !/trust-line">[^<]*allowed/.test(hero));
check("the line is short enough to hold one line at 390px (<= 50 chars)",
  ("Not released yet — this demo is a simulation.").length <= 50);
check("no unverified claims anywhere in the hero copy",
  !/credit card/i.test(hero) && !/free forever/i.test(hero) && !/cancel anytime/i.test(hero));
check("the ethics sentence keeps its proper homes (the footer here, the privacy page's lead)",
  html.includes("© 2026 Interview Assistant. Use only where you are allowed to.") &&
  privacy.includes("Use only where you are allowed to. This page states the facts plainly"));
check("the trust line carries no bottom margin (the grid gap stands alone)",
  /\.trust-line \{[^}]*margin-bottom: 0;/.test(clean) &&
  /\.trust-line \{[^}]*font-size: 14px;/.test(clean));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
