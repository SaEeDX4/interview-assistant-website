"use strict";
/*
 * Step 96 — the Pricing page becomes "The plan ledger": the two
 * plans as cards (the object the page never had), each carrying its
 * price with its status attached — Trial $0 (real today) and Pro
 * $19.99 with the reference-price label inside the price block, so
 * the figure never appears bare where it leads. The hero states the
 * state once, up top (paid checkout is not open). The comparison
 * table is Terms §2 verbatim (the unverifiable "Concurrent live
 * sessions" row is gone; question-bank and caps rows added from the
 * verified facts), the refunds copy restates the finalized Terms
 * §5 (it previously pointed at a "draft" that no longer exists),
 * and the finder / calculator Step 2 contracts survive untouched.
 * app.js is not edited; the chrome and the JSON-LD stay
 * byte-identical; the static page invents no annual price,
 * discount, tier, testimonial or count, and offers no buy-shaped
 * control anywhere.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const css = read("website/styles.css");
const pr = read("website/pricing.html");
const index = read("website/index.html");
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
const has = (hay, s) => hay.includes(s);
const count = (hay, s) => hay.split(s).length - 1;
const main = pr.split('<main id="main"')[1].split("</main>")[0];

/* A — chrome: byte-identical to the other ten pages. */
function block(html, tag) {
  const m = html.match(new RegExp("<" + tag + "[\\s\\S]*?</" + tag + ">"));
  return m ? m[0].replace(/ aria-current="page"/g, "") : "";
}
check("header is byte-identical to the home page's (modulo aria-current)",
  block(pr, "header") === block(index, "header"));
check("footer is byte-identical to the home page's (modulo aria-current)",
  block(pr, "footer") === block(index, "footer"));
check("JSON-LD is byte-identical to the home page's (the labelled sandbox Offer)",
  pr.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1] ===
  index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

/* B — the state, stated once up top and on the card. */
check("hero state line: paid checkout is not open yet",
  has(main, "Paid checkout is not open yet — nobody can pay today."));
check("the state line is in the hero, before the plans section",
  pr.indexOf("prx-state") < pr.indexOf('aria-label="Plans"'));
check("Pro card: the figure travels with its reference label",
  has(main, '<span class="prx-amount">$19.99</span>') &&
  has(main, "<strong>Reference price.</strong>") &&
  has(main, "not confirmed for launch, and checkout is not open"));
check("Pro card: the binding rule is the Terms §2 checkout price + 30 days' notice",
  has(main, "The price that binds is the one shown at checkout before you confirm") &&
  has(main, "at least 30 days’ notice (Terms §2)"));

/* C — the plan cards: facts are Terms §2 + the verified features. */
check("two plan cards, Trial then Pro",
  count(main, 'class="card prx-plan') === 2 &&
  main.indexOf("Trial") < main.indexOf("prx-plan-pro"));
check("Trial card: $0, 30 lifetime minutes, 1 profile, 2 prep runs, 1 device, 14 days",
  has(main, '<span class="prx-amount">$0</span>') &&
  has(main, "<strong>30 live minutes</strong> — one lifetime allowance") &&
  has(main, "1 candidate profile") && has(main, "2 preparation runs a month") &&
  has(main, "1 device") && has(main, "Reports kept 14 days"));
check("Pro card: 600 per period, 3 profiles, 20 prep runs, 2 devices, 365 days",
  has(main, "<strong>600 live minutes</strong> per billing period") &&
  has(main, "3 candidate profiles") && has(main, "20 preparation runs a month") &&
  has(main, "2 devices") && has(main, "Reports kept 365 days"));
check("both cards: Coach Mode and all 10 languages included",
  count(main, "Coach Mode and all 10 languages included") === 2);
check("card CTAs are the honest routes only (demo for Trial, download for Pro)",
  has(main, '<p class="prx-plan-cta"><a class="btn btn-primary" href="demo.html">Try the live demo</a></p>') &&
  has(main, '<p class="prx-plan-cta"><a class="btn btn-secondary" href="download.html">See the release status</a></p>'));

/* D — honesty invariants: nothing invented, nothing buy-shaped. */
check("no buy-shaped control anywhere in <main>",
  ![...main.matchAll(/<(a|button)\b[^>]*>((?:(?!<(?:a|button)\b)[\s\S])*?)<\/\1>/g)]
    .some((m) => /buy|subscribe|checkout|upgrade|get pro/i.test(m[2].replace(/<[^>]+>/g, ""))));
check("no invented furniture: no annual price, discount, savings, countdown, tier or testimonial",
  !/per year|billed annually|save \d|% off|limited time|most popular|team plan|enterprise/i.test(main));
check("every $19.99 in <main> is the labelled reference (asterisk, label or FAQ question)",
  count(main, "19.99") >= 4 && has(main, "* Sandbox reference price") &&
  has(main, "Reference price.</strong>") && has(main, "Is $19.99 the final price?"));
check("stale copy is gone: no draft Terms, no concurrent-sessions row, no heartbeat",
  !has(main, "draft Terms") && !has(main, "Concurrent live sessions") &&
  !/heartbeat/i.test(main) && !has(main, "About the Pro price"));

/* E — the table is Terms §2 verbatim + verified rows. */
check("compare table: 9 rows, headers carry the labelled price",
  count(main, "<tr><td>") === 9 &&
  has(main, '<th scope="col">Trial — $0</th>') &&
  has(main, '<th scope="col">Pro — $19.99 / month *</th>'));
check("compare table: the unverifiable row replaced by verified rows",
  has(main, "Question bank — 50–150 questions from your resume + job description") &&
  has(main, "Safety caps — the same for everyone") &&
  has(main, "240 min/day · 120 min/session"));
check("data-labels: at least 16, each equal to its column header",
  count(main, 'data-label="Trial — $0"') === 9 &&
  count(main, 'data-label="Pro — $19.99 / month *"') === 9);

/* F — Terms §5 restated, framed for when paid plans open. */
check("refunds: the framing sentence (checkout closed, rules as Terms §5 states them)",
  has(main, "paid checkout is not open, so there is no live subscription to cancel") &&
  has(main, "exactly as the Terms (§5) state them"));
check("refunds: statutory rights first, and they prevail where greater",
  has(main, "statutory rights first.</strong>") && has(main, "they prevail"));
check("refunds: first Pro payment refundable in full within 14 days",
  has(main, "Ask within 14 days of your first Pro payment and that payment is refunded in full"));
check("refunds: renewals non-refundable; our-ending pro-rata; Paddle to the original method",
  has(main, "Fees for a billing period that has already begun are not refundable") &&
  has(main, "the unused part of your current paid period is refunded, pro-rated") &&
  has(main, "issued by Paddle to the original payment method"));
check("cancel: portal, keep Pro to period end, fall back to Trial",
  has(main, "You keep Pro until the end of your paid period") &&
  has(main, "your account then falls back to Trial"));
check("the Terms link names the final Terms and its sections",
  has(main, "Read the Terms — §2 plans and prices, §5 payment and refunds →"));
check("FAQ: rollover answered from the final Terms; the price question answered",
  has(main, "make no provision for unused minutes to roll into the next period") &&
  has(main, "It is the current reference price, from Paddle’s sandbox catalog — not a promise"));

/* G — the surviving contracts. */
check("finder contract: form, four fieldsets, the Step 2 field names",
  has(pr, 'id="plan-finder"') && count(pr, "<fieldset>") === 4 &&
  ["pf-interviews", "pf-profiles", "pf-devices", "pf-prep"].every((n) => has(pr, 'name="' + n + '"')) &&
  has(pr, 'id="finder-result"'));
check("calculator contract: both sliders, both outputs, the result region",
  ["calc-interviews", "calc-minutes", "calc-interviews-out", "calc-minutes-out", "calc-result"]
    .every((id) => has(pr, 'id="' + id + '"')));
check("growth slot + help block placement survive (Steps 48/57)",
  has(pr, 'id="ia-growth-pricing" hidden') &&
  pr.indexOf('id="pricing-help"') > pr.indexOf('class="compare"') &&
  pr.indexOf('id="pricing-help"') < pr.indexOf('id="plan-finder"'));
check("caps as stat blocks (240/day, 120/session)",
  has(main, '<p class="prx-cap-num">240</p>') && has(main, '<p class="prx-cap-num">120</p>'));
check("meter card survives with its to-scale claim (600/30 = 20x)",
  has(main, "Pro gives you 20× the live minutes of the Trial"));

/* H — the CSS: one page-scoped section, admitted widths only. */
const prxCss = css.split("Step 96: the Pricing page")[1].split("/* ----------")[0];
check("the Step 96 CSS section exists and is page-scoped",
  !!prxCss && has(prxCss, ".prx-plans") && has(prxCss, ".prx-plan") &&
  has(prxCss, ".prx-ref") && has(prxCss, ".prx-caps"));
check("the Step 96 CSS adds media blocks only at the admitted 640px",
  !/@media \(max-width: (?!640px)/.test(prxCss) && has(prxCss, "@media (max-width: 640px)"));
check("no capsule radius in the Step 96 CSS",
  !/999px|border-radius:\s*50%/.test(prxCss));

/* I — the live behaviour probe. */
const PY = process.env.PW_PYTHON || "python3";
let probeOk = false, probeTail = "";
try {
  const out = execFileSync(PY, [path.join(__dirname, "probe-step96.py")],
    { encoding: "utf8", timeout: 420000, stdio: ["ignore", "pipe", "pipe"] });
  probeOk = out.includes("PROBE96 OK");
  probeTail = out.trim().split("\n").slice(-3).join(" | ");
} catch (e) {
  probeTail = String(e.stdout || e.message).trim().split("\n").slice(-4).join(" | ");
}
check("probe-step96.py: cards, labels, table, finder/calculator behaviour, no-JS + reduced-motion at 403–1200 (" + probeTail + ")", probeOk);

console.log("\nStep 96: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
