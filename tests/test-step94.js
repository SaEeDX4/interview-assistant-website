"use strict";
/*
 * Step 94 — the 404 page becomes "The app answers its own 404":
 * the canonical two-box app window (QUESTION over ANSWER, the same
 * window as everywhere else on the site) fields the lost visitor's
 * question, and each of its three answer points carries a real route
 * out (home / live demo / support), with a quiet second-tier line
 * (Pricing · Download · Features) below. The chrome stays
 * byte-identical to the other ten pages; the page keeps its 404
 * semantics (noindex, no JSON-LD, no sticky bar); without JS the
 * settled answer is simply there, and the page's one inline script
 * is progressive enhancement only (deep-path link repair, the asked
 * address woven into the question, and the answer beat on the
 * site's existing keyframes inside the Step 86 dots budget).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const css = read("website/styles.css");
const e404 = read("website/404.html");
const index = read("website/index.html");
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
const has = (hay, s) => hay.includes(s);
const count = (hay, s) => hay.split(s).length - 1;

/* A — semantics + chrome: still a real 404 page, still this site. */
check("title + noindex + no JSON-LD survive",
  has(e404, "<title>Page not found — Interview Assistant</title>") &&
  has(e404, '<meta name="robots" content="noindex">') && !has(e404, "ld+json"));
check("no sticky bar on the 404 (by design, Step 17)",
  !has(e404, "sticky-bar") && !has(e404, "cta-visible"));
function block(html, tag) {
  const m = html.match(new RegExp("<" + tag + "[\\s\\S]*?</" + tag + ">"));
  return m ? m[0].replace(/ aria-current="page"/g, "") : "";
}
check("header is byte-identical to the home page's (modulo aria-current)",
  block(e404, "header") === block(index, "header"));
check("footer is byte-identical to the home page's (modulo aria-current)",
  block(e404, "footer") === block(index, "footer"));

/* B — the window: canonical shell, one instance, live cards. */
check("exactly one app window, page-scoped as .nf-window",
  count(e404, 'class="app-window nf-window"') === 1 && count(e404, "app-window") >= 1);
check("the window wears the canonical Live header (pill at Answer ready)",
  has(e404, '<div class="app-header" aria-hidden="true">') &&
  has(e404, '<p class="app-pill">') && has(e404, "<span>Answer ready</span>") &&
  has(e404, 'class="app-start"') && has(e404, 'class="app-win-btn"'));
check("QUESTION card over ANSWER card, in the app's own labels",
  has(e404, '<span class="app-card-label">Question</span>') &&
  has(e404, '<span class="app-card-label">Answer</span>') &&
  e404.indexOf(">Question<") < e404.indexOf(">Answer<") &&
  has(e404, 'class="app-card app-card--answer"'));
check("the question is the lost visitor's, with a slot for the real address",
  has(e404, 'id="nf-question"') && has(e404, 'id="nf-path"') &&
  has(e404, ">this page</span>?"));
check("the cards are live content (not aria-hidden like a depiction)",
  !/<section class="app-card[^"]*" aria-hidden/.test(e404));

/* C — the answer: three points, three real routes, in hierarchy order. */
const points = e404.split('<ul class="app-answer" id="nf-points">')[1].split("</ul>")[0];
check("the answer is exactly three points",
  count(points, "<li>") === 3 && count(points, 'class="app-dot"') === 3);
check("each point carries exactly one link",
  count(points, "<a href=") === 3);
check("the routes are home, demo, support — in that order",
  points.indexOf('href="index.html"') > -1 &&
  points.indexOf('href="index.html"') < points.indexOf('href="demo.html"') &&
  points.indexOf('href="demo.html"') < points.indexOf('href="support.html"'));
check("the second-tier line carries Pricing, Download, Features",
  has(e404, '<p class="nf-more">Also here: <a href="pricing.html">Pricing</a>') &&
  has(e404, '<a href="download.html">Download</a>') &&
  has(e404, '<a href="features.html">Features</a>'));
check("the old button row is retired (its routes live in the window now)",
  !has(e404, "cta-row") && !has(e404, "Back to home"));

/* D — copy: plain headline, one cause line, no blame, no hype. */
check("the H1 stays plain: This page doesn't exist.",
  has(e404, "<h1>This page doesn&rsquo;t exist.</h1>"));
check("the lede names the likely causes in one line",
  has(e404, "The address is wrong, or the page has moved."));
check("no exclamation marks anywhere in the page's own copy",
  !e404.split("</header>")[1].split("<footer")[0]
    .replace(/<script>[\s\S]*?<\/script>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "").includes("!"));

/* E — the floor and the enhancement. */
check("the thinking dots start hidden (the settled answer is the floor)",
  has(e404, '<p class="app-thinking is-hidden" id="nf-thinking" aria-hidden="true">'));
check("exactly two scripts: the page's own enhancement + app.js",
  count(e404, "<script") === 2 && has(e404, '<script src="app.js"></script>'));
check("the script gates the beat on prefers-reduced-motion",
  has(e404, 'matchMedia("(prefers-reduced-motion: reduce)")'));
check("the dots budget is the Step 86 one (400ms), the stagger 150ms",
  has(e404, "}, 400);") && has(e404, "i * 150"));
check("the deep-path repair rewrites only relative references",
  has(e404, 'if (dir !== "/")') && has(e404, "/^(?![a-z][a-z0-9+.-]*:|\\/|#)/i"));

/* F — page-scoped CSS: .nf-* only, on-scale, no new breakpoints. */
const nfCss = css.split("Step 94: the 404 page")[1].split("/* ----------")[0];
check("the Step 94 CSS section exists and is page-scoped",
  !!nfCss && has(nfCss, ".nf-window") && has(nfCss, ".nf-more") && has(nfCss, ".nf-visual"));
check("the Step 94 CSS adds no media queries (closed breakpoint set untouched)",
  !nfCss.includes("@media"));
check("the answer card hugs its points in this context (min-height 0)",
  has(nfCss, ".nf-window .app-card--answer { min-height: 0; }"));
check("answer links read as links inside the window (app accent + underline)",
  has(nfCss, ".nf-window .app-answer a") && has(nfCss, "text-decoration: underline"));
check("body carries the page class",
  has(e404, '<body class="page-404">'));

/* G — the live behaviour probe. */
const PY = process.env.PW_PYTHON || "python3";
let probeOk = false, probeTail = "";
try {
  const out = execFileSync(PY, [path.join(__dirname, "probe-step94.py")],
    { encoding: "utf8", timeout: 420000, stdio: ["ignore", "pipe", "pipe"] });
  probeOk = out.includes("PROBE94 OK");
  probeTail = out.trim().split("\n").slice(-3).join(" | ");
} catch (e) {
  probeTail = String(e.stdout || e.message).trim().split("\n").slice(-4).join(" | ");
}
check("probe-step94.py: geometry, beat, floors, deep-path repair at 403–1200 (" + probeTail + ")", probeOk);

console.log("\nStep 94: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
