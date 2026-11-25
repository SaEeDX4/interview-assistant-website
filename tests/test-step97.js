"use strict";
/*
 * Bucket-A fix run (2026-11-25) — every Bucket A finding from the
 * site audit (~/workspace/site-audit-2026-11-25/report.md) fixed in
 * one run, on the owner's order. This suite pins the run's
 * contracts:
 *  A1  Platforms tells the current platform truth (Android built,
 *      iOS/Mac planned native apps) — the stale research framing
 *      is gone from the page, its meta and its roadmap.
 *  A2  The same truth in the Support FAQ and in app.js's own
 *      answer banks (assistant flow, FAQ bank, download PLANNED).
 *  A3  Features' matrix row follows Terms §2's label ("Reports
 *      kept"); the orphaned .callout-warn rule is deleted.
 *  A4  Reduced-motion demo visitors see the interviewer's still
 *      portrait: the front video stays rendered-but-paused under
 *      .is-static so its poster paints.
 *  A5  The demo status stops saying "Preparing…" once the first
 *      word lands (streamRows' onFirstWord hook → "Writing…").
 *  A6  The JSON-LD Pro Offer carries no bare machine-readable
 *      price (the Terms' own precedent: no price until checkout
 *      opens); the labelled description stays, byte-identical
 *      across the ten pages that carry the block.
 *  A7  Sitemap lastmod values are the pages' real change dates.
 *  A8  Privacy prints as a paper document (body.page-privacy +
 *      its own @media print block), like the Terms.
 *  A9  The demo stops pre-transferring ~2.9 MB: warming is
 *      deferred to the first interaction (or 12 idle seconds),
 *      and only the chosen persona's poster is ever requested.
 *  A10 Privacy's body no longer calls the final Terms a draft.
 *  A11 The deploy workflow minifies avatar.js and spotlight.js
 *      too, and reverify46 rebuilds and byte-compares them.
 *  A12 favicon.ico and apple-touch-icon.png exist at the root.
 *  A13 Home's price phrasing meets the Pricing standard: the
 *      sandbox qualifier travels with the figure in the FAQ, and
 *      the meta says "30 live minutes", not a trial window.
 *  A14 No page labels the final Terms "(draft)" anywhere.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const PAGES = ["index.html", "demo.html", "features.html", "how-it-works.html",
  "platforms.html", "pricing.html", "download.html", "support.html",
  "privacy.html", "terms.html", "404.html"];
const html = {};
for (const p of PAGES) { html[p] = read("website/" + p); }
const css = read("website/styles.css");
const js = read("website/app.js");
const av = read("website/avatar.js");
const wf = read(".github/workflows/static.yml");
const sitemap = read("website/sitemap.xml");
let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
const has = (hay, s) => hay.includes(s);
const count = (hay, s) => hay.split(s).length - 1;

/* A14 + A10 — the final Terms are never called a draft. */
check("A14: no page contains 'Terms (draft)'",
  PAGES.every((p) => !has(html[p], "Terms (draft)")));
check("A14: every page links the Terms exactly twice in chrome (nav + footer)",
  PAGES.every((p) => {
    const chrome = (html[p].match(/<header[\s\S]*?<\/header>/) || [""])[0] +
      (html[p].match(/<footer[\s\S]*?<\/footer>/) || [""])[0];
    return (chrome.match(/href="terms\.html"( aria-current="page")?>Terms<\/a>/g) || []).length === 2;
  }));
check("A10: Privacy's body carries no 'draft Terms' and links 'Read the Terms'",
  !has(html["privacy.html"], "draft Terms") &&
  count(html["privacy.html"], "Read the Terms →") === 2 &&
  has(html["privacy.html"], "The Terms — plans, live minutes, and authorised use."));

/* A1 — Platforms tells the truth. */
{
  const pl = html["platforms.html"];
  check("A1: the stale research framing is gone from Platforms",
    !has(pl, "companion first") && !has(pl, "Feasibility UNKNOWN") &&
    !has(pl, "phased research") && !has(pl, "still being tested") &&
    !has(pl, "UNKNOWN until tested") && !has(pl, "Planning — Phase 3") &&
    !has(pl, "audio feasibility") && !has(pl, "ScreenCaptureKit"));
  check("A1: Android is stated built — a full mirror, not yet published",
    has(pl, "Built — not yet published") && has(pl, "a full mirror of the Windows app") &&
    has(pl, "there is no APK to download"));
  check("A1: the cards wear the site's status vocabulary (current for Android, plan for iOS/Mac)",
    (() => {
      const cards = pl.match(/<article class="card platform-card">[\s\S]*?<\/article>/g) || [];
      return cards.length === 4 && has(cards[1], "badge-current") &&
        has(cards[2], "badge-plan") && has(cards[3], "badge-plan") &&
        !pl.includes("badge-unknown");
    })());
  check("A1: meta, H1 and roadmap phases carry the same truth",
    has(pl, "Android built, not yet published; iOS and Mac as planned native apps") &&
    has(pl, "Windows first. Android built. iOS and Mac planned — as native apps.") &&
    has(pl, "iOS follows Android, as its own") && has(pl, "dedicated native Mac app") &&
    has(pl, "Phase 3 — Android publication") && has(pl, "Phase 4 — iOS and native Mac apps"));
}

/* A2 — Support FAQ + the assistant's own banks tell the same truth. */
check("A2: no stale platform framing survives anywhere in app.js",
  !has(js, "companion first") && !has(js, "research phases") &&
  !has(js, "still being researched") && !has(js, "planned as a companion"));
check("A2: the Support FAQ answer is corrected",
  has(html["support.html"], "The Android app is built — a full mirror of the Windows app — but it is not published yet"));
check("A2: the assistant bank, FAQ bank and download PLANNED strings are corrected",
  has(js, "The Android app is built — a full mirror of Windows — but it is not published yet") &&
  has(js, "Interview Assistant for Android is built — the full app, mirroring Windows"));

/* A3 — the battery's two failures, fixed at the root. */
check("A3: Features' matrix row uses Terms §2's label, 'Reports kept'",
  has(html["features.html"], "<tr><td>Reports kept</td>") &&
  !has(html["features.html"], "Report retention"));
check("A3: the orphaned .callout-warn rule is deleted from the sheet",
  !has(css, ".callout-warn"));

/* A4 — the still poster paints in static mode. */
check("A4: the front video stays rendered under .is-static (poster paints)",
  has(css, ".avatar-frame.is-static .avatar-video.is-front { display: block; }") &&
  css.indexOf(".avatar-frame.is-static .avatar-video { display: none; }") <
    css.indexOf(".avatar-frame.is-static .avatar-video.is-front { display: block; }"));

/* A5 — the status reflects the stream's real phase. */
check("A5: streamRows carries the onFirstWord hook and fires it at the first word",
  has(js, "function streamRows(layer, tempo, schedule, done, dotsAlready, onFirstWord)") &&
  has(js, "if (onFirstWord) { onFirstWord(); }") &&
  has(js, "function streamStartedStatus() { setStatus(\"Writing your points…\"); }"));
check("A5: classic, typed and scene paths pass the hook; scene beats with their own statusText keep it",
  count(js, "streamStartedStatus") >= 5 &&
  has(js, "opts.statusText ? null : streamStartedStatus") &&
  has(js, "\"Writing your points…\",\n    \"3 points ready — sample.\""));

/* A6 — no bare machine-readable price; the block stays uniform. */
{
  const blocks = PAGES.filter((p) => p !== "404.html").map((p) => {
    const m = html[p].match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    return m ? m[1] : "";
  });
  check("A6: the JSON-LD Pro Offer carries no price fields, on any page",
    blocks.every((b) => {
      if (!b) { return false; }
      try {
        const offers = JSON.parse(b).offers || [];
        const pro = offers.find((o) => o.name === "Pro");
        return !!pro && !("price" in pro) && !("priceCurrency" in pro);
      } catch (e) { return false; }
    }));
  check("A6: the labelled description and the Pro Offer itself survive",
    blocks.every((b) => has(b, '"name": "Pro"') &&
      has(b, "Indicative Paddle sandbox reference price. Final live price to be confirmed before checkout opens.")));
  check("A6: the JSON-LD block is still byte-identical across all ten pages",
    blocks.every((b) => b === blocks[0]));
}

/* A7 — sitemap dates are real. */
check("A7: no sitemap lastmod is frozen at 2026-11-17",
  !has(sitemap, "2026-11-17"));
check("A7: lastmod matches each page's real last-change date",
  has(sitemap, "<loc>https://cybervalida.online/how-it-works.html</loc><lastmod>2026-11-23</lastmod>") &&
  has(sitemap, "<loc>https://cybervalida.online/download.html</loc><lastmod>2026-11-24</lastmod>") &&
  has(sitemap, "<loc>https://cybervalida.online/terms.html</loc><lastmod>2026-11-24</lastmod>") &&
  has(sitemap, "<loc>https://cybervalida.online/pricing.html</loc><lastmod>2026-11-25</lastmod>"));

/* A8 — Privacy prints on paper. */
check("A8: Privacy carries its page class and a scoped print block",
  has(html["privacy.html"], '<body class="page-privacy">') &&
  has(css, "body.page-privacy { background: var(--paper); color: var(--ink); }"));

/* A9 — deferred warming; one poster only. */
check("A9: demo.html hardcodes no persona poster",
  !has(html["demo.html"], 'poster="avatar/'));
check("A9: warming is armed on first interaction with an idle fallback, not fired at takeover",
  has(av, "function armWarming()") && has(av, 'addEventListener("pointerdown", warmNow, true)') &&
  has(av, "setTimeout(warmNow, 12000)") &&
  has(av, "    api.active = true;\n    armWarming();"));

/* A11 — the pipeline minifies all three demo scripts. */
check("A11: the workflow minifies avatar.js and spotlight.js with the pinned terser",
  has(wf, "terser@5.51.2 website/avatar.js --compress --mangle") &&
  has(wf, "terser@5.51.2 website/spotlight.js --compress --mangle"));
check("A11: reverify46 rebuilds and byte-compares them too",
  has(read("tests/reverify46.py"), 'str(web / "avatar.js")') &&
  has(read("tests/reverify46.py"), "live avatar.js byte-identical"));

/* A12 — the root icons exist. */
check("A12: favicon.ico and apple-touch-icon.png exist at the site root",
  fs.existsSync(path.join(ROOT, "website", "favicon.ico")) &&
  fs.statSync(path.join(ROOT, "website", "favicon.ico")).size > 500 &&
  fs.existsSync(path.join(ROOT, "website", "apple-touch-icon.png")) &&
  fs.statSync(path.join(ROOT, "website", "apple-touch-icon.png")).size > 1000);

/* A13 — Home's price phrasing meets the Pricing standard. */
check("A13: the meta counts live minutes, not a trial window",
  has(html["index.html"], "30 live minutes, free.") &&
  !has(html["index.html"], "Free 30-minute trial"));
check("A13: the FAQ answer welds the sandbox qualifier to the figure",
  has(html["index.html"], "Pro is USD 19.99 a month — the Paddle sandbox reference price, not confirmed for launch, and paid checkout is not open yet — for 600 live"));

/* The live behaviour probe (Playwright): A4's painted poster at
   five widths, A5's status sequence, A8's print rendering, and
   the A1/A2 screenshot passes. */
const { execFileSync } = require("child_process");
let probeOk = false, probeTail = "";
try {
  const PY = process.env.PW_PYTHON || "python3";
  const out = execFileSync(PY, [path.join(__dirname, "probe-step97.py")],
    { encoding: "utf8", timeout: 600000, env: { ...process.env } });
  probeOk = out.includes("PROBE97 OK");
  probeTail = out.trim().split("\n").slice(-3).join(" | ");
} catch (e) {
  probeTail = String(e.stdout || e.message).trim().split("\n").slice(-4).join(" | ");
}
check("probe-step97.py: A4 poster at 5 widths, A5 status sequence, A8 print, A1/A2 passes (" + probeTail + ")", probeOk);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
