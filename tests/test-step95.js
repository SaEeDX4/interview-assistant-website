"use strict";
/*
 * Step 95 — the Download page becomes "The release desk": an honest
 * hero (the not-yet answer plus the self-updating mechanism — the
 * page is wired to the Step 41 release service), the recommendation
 * panel completed with its artifact spec (the retired "Two ways to
 * run it" section folded in), the four-platform board wearing the
 * site's status badges (Windows: first platform; Android: built —
 * not yet published; iOS + Mac: planned), and a designed meanwhile
 * band routing the visitor to the live demo. The Step 41 JS
 * contract (ids, card structure, the disabled artifact pair, the
 * pinned honesty sentences) survives untouched; app.js is not
 * edited; the chrome stays byte-identical; the static page invents
 * no version, size or binary link and offers no fake notify.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const css = read("website/styles.css");
const dl = read("website/download.html");
const index = read("website/index.html");
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
const has = (hay, s) => hay.includes(s);
const count = (hay, s) => hay.split(s).length - 1;

/* A — chrome: byte-identical to the other ten pages. */
function block(html, tag) {
  const m = html.match(new RegExp("<" + tag + "[\\s\\S]*?</" + tag + ">"));
  return m ? m[0].replace(/ aria-current="page"/g, "") : "";
}
check("header is byte-identical to the home page's (modulo aria-current)",
  block(dl, "header") === block(index, "header"));
check("footer is byte-identical to the home page's (modulo aria-current)",
  block(dl, "footer") === block(index, "footer"));
check("no sticky bar on the download page (by design, Step 6/17)",
  !has(dl, 'id="sticky-cta"'));

/* B — the Step 41 contract: ids, order, the disabled pair. */
check("the manifest contract ids all survive",
  ["dl-rec", "dl-rec-label", "dl-rec-title", "dl-rec-status", "dl-rec-detected",
   "dl-rec-live", "dl-rec-actions", "download-note", "dl-after", "dl-after-text",
   "dl-after-sha", "dl-platforms", "dl-whatsnew", "dl-whatsnew-title",
   "dl-whatsnew-body", "dl-all", "dl-all-title", "dl-all-body",
   "download-help", "dl-help-state"].every((id) => has(dl, 'id="' + id + '"')));
check("cards in fixed order windows/android/ios/mac",
  JSON.stringify([...dl.matchAll(/data-platform="(\w+)"/g)].map((m) => m[1])) ===
  JSON.stringify(["windows", "android", "ios", "mac"]));
const cards = dl.split('<article class="card dl-card"').slice(1)
  .map((seg) => seg.split("</article>")[0]);
check("all four cards are status-only statically (no link, no button)",
  cards.length === 4 && cards.every((c) => !/<a\s/.test(c) && !/<button/.test(c)));
const panel = dl.split('id="dl-platforms"')[0];
check("the panel keeps the two disabled Windows buttons",
  has(panel, 'id="dl-installer"') && has(panel, 'id="dl-portable"') &&
  (panel.match(/disabled/g) || []).length >= 2);
check("the pinned honesty sentences survive verbatim",
  has(dl, "Signed installer + SHA-256: not yet published") &&
  has(dl, "The buttons below will go live with the first signed release") &&
  has(dl, "we will not link a file that does not exist"));
check("help block placement: after the platform grid, before What's new (Step 57)",
  dl.indexOf('id="download-help"') > dl.indexOf('id="dl-platforms"') &&
  dl.indexOf('id="download-help"') < dl.indexOf('id="dl-whatsnew"'));

/* C — the new copy: the answer up top, the statuses as they stand. */
check("the hero lead answers first: not published yet, on any platform",
  has(dl, "The first signed release is not published yet — on any platform."));
check("the hero names the self-updating mechanism (the release service)",
  has(dl, "connected to our release service") &&
  has(dl, "its download appears here: version, size and SHA-256 included"));
check("Windows wears the First platform badge",
  has(dl, '<span class="badge badge-now">First platform</span>'));
check("Android wears the Built — not yet published badge",
  has(dl, '<span class="badge badge-current">Built — not yet published</span>'));
check("iOS and Mac wear Planned badges",
  count(dl, '<span class="badge badge-plan">Planned</span>') === 2);
check("Android's status is the owner's current fact: built, unpublished, no APK",
  has(dl, "The Android app is built.") && has(dl, "there is no APK to download"));
check("the stale Step 41 statuses are gone",
  !has(dl, "Planned — Phase 3. No APK, no date.") &&
  !has(dl, "feasibility still being researched") &&
  !has(dl, "Companion first: preparation and practise on the go"));
check("iOS makes no TestFlight promise; Mac is a dedicated native app",
  has(dl, "No date, and no TestFlight promise.") &&
  has(dl, "A dedicated native app — not a port"));

/* D — honesty invariants: nothing invented, nothing fake offered. */
check("the static page invents no version, size or binary link",
  !/Version \d/.test(dl) && !/\d+(\.\d+)?\s?MB/.test(dl) &&
  !/href="[^"]+\.(exe|zip|apk|dmg|pkg)"/i.test(dl));
check("no fake notify: no form, no store badge, no pre-registration promise",
  !has(dl, "<form") && !has(dl, "play.google.com") && !has(dl, "apps.apple.com") &&
  !/notify me/i.test(dl) && !/waitlist/i.test(dl));

/* E — the desk's new furniture: artifact spec + the meanwhile band. */
check("the artifact spec folds the two downloads into the panel",
  count(dl, 'class="dlx-artifact"') === 2 &&
  has(dl, "<h3>Installer</h3>") && has(dl, "<h3>Portable ZIP</h3>") &&
  dl.indexOf('class="dlx-artifacts"') < dl.indexOf('id="dl-platforms"'));
check("the retired 'Two ways to run it' section is gone (its facts moved up)",
  !has(dl, "Two ways to run it"));
check("the meanwhile band routes to the demo, then how it works",
  has(dl, 'class="dlx-meanwhile"') &&
  dl.indexOf('class="dlx-meanwhile"') > dl.indexOf('id="dl-platforms"') &&
  dl.indexOf('class="dlx-meanwhile"') < dl.indexOf('id="download-help"') &&
  dl.indexOf('<a class="btn btn-primary" href="demo.html">Try the live demo</a>') >
    dl.indexOf('class="dlx-meanwhile"') &&
  dl.indexOf('<a class="btn btn-secondary" href="how-it-works.html">How it works</a>') >
    dl.indexOf('<a class="btn btn-primary" href="demo.html">Try the live demo</a>'));
check("the board has its title and its no-dates line",
  has(dl, '<h2 class="dlx-board-title">Every platform, as it stands</h2>') &&
  has(dl, "no dates we cannot keep"));

/* F — page-scoped CSS: .dlx-* only, on-scale, closed breakpoints. */
const dlxCss = css.split("Step 95: the Download page")[1].split("/* ----------")[0];
check("the Step 95 CSS section exists and is page-scoped",
  !!dlxCss && has(dlxCss, ".dlx-artifacts") && has(dlxCss, ".dlx-meanwhile") &&
  has(dlxCss, ".dlx-card-badge"));
check("the Step 95 CSS adds media blocks only at the admitted 640px",
  !/@media \(max-width: (?!640px)/.test(dlxCss) && has(dlxCss, "@media (max-width: 640px)"));
check("no capsule radius in the Step 95 CSS",
  !/999px|border-radius:\s*50%/.test(dlxCss));

/* G — the live behaviour probe. */
const PY = process.env.PW_PYTHON || "python3";
let probeOk = false, probeTail = "";
try {
  const out = execFileSync(PY, [path.join(__dirname, "probe-step95.py")],
    { encoding: "utf8", timeout: 420000, stdio: ["ignore", "pipe", "pipe"] });
  probeOk = out.includes("PROBE95 OK");
  probeTail = out.trim().split("\n").slice(-3).join(" | ");
} catch (e) {
  probeTail = String(e.stdout || e.message).trim().split("\n").slice(-4).join(" | ");
}
check("probe-step95.py: floor, contract, badges, routes + fixture-manifest release state at 403–1200 (" + probeTail + ")", probeOk);

console.log("\nStep 95: " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
