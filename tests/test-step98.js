"use strict";
/*
 * Step 98 — footer fix run (2026-11-26), from the footer review
 * (~/workspace/footer-review/report.md). Pins the run's contracts:
 *  F1  The legal row's designed 20px top padding (SPACING.md R20)
 *      survives at <=640px: inside the 640px block, a
 *      .footer-bottom { padding-top: 20px; } rule stands AFTER the
 *      .container { padding: 0 16px; } shorthand that used to reset
 *      it to 0 at equal specificity, so 20px wins by source order.
 *      No new breakpoint — the rule lives in the existing block.
 *  F2  The legal row's wrap is designed: .footer-bottom carries
 *      gap: 12px 24px (on the SPACING scale), so the wrapped
 *      two-row state at 712-768px has a real 12px row gap, while
 *      justify-content: space-between keeps the single-row
 *      left/right split at 933/1200px untouched.
 *  F4  The legal-row link's tap box is >=28px tall by construction:
 *      .footer-bottom a carries padding: 4px 0 with the equal
 *      compensating margin: -4px 0, so its layout box — and the
 *      row's height — does not move.
 *  F8  index.html's footer carries no aria-current (the redundant
 *      third occurrence is gone); the header brand and mobile-nav
 *      occurrences stay, and the footer markup is byte-identical
 *      across all 11 pages again.
 *  F3  The "Billing — via Paddle" link no longer points at the
 *      "How do I cancel Pro?" FAQ (support.html#faq-b9); it goes to
 *      pricing.html, where billing via Paddle is explained. The
 *      label text is unchanged. (test-step32's legal-row pin was
 *      re-pinned with annotation in the same step.)
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const WEB = path.join(ROOT, "website");
const css = fs.readFileSync(path.join(WEB, "styles.css"), "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

const PAGES = ["404.html", "demo.html", "download.html", "features.html",
  "how-it-works.html", "index.html", "platforms.html", "pricing.html",
  "privacy.html", "support.html", "terms.html"];
const htmls = PAGES.map((p) => fs.readFileSync(path.join(WEB, p), "utf8"));
const footOf = (h) => (h.match(/<footer[\s\S]*?<\/footer>/) || [""])[0];

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

/* ---------- F1: the 20px top padding wins at <=640px ---------- */
check("F1 base rule still designs padding-top: 20px on .footer-bottom",
  /\.footer-bottom\s*\{[^}]*padding-top:\s*20px;/.test(clean));
const containerIdx = clean.indexOf(".container { padding: 0 16px; }");
const restoreIdx = clean.indexOf(".footer-bottom { padding-top: 20px; }");
const nextMediaIdx = clean.indexOf("@media", containerIdx + 1);
check("F1 a .footer-bottom padding-top restore stands after the <=640 .container shorthand, inside the same block",
  containerIdx >= 0 && restoreIdx > containerIdx && (nextMediaIdx < 0 || restoreIdx < nextMediaIdx),
  `container=${containerIdx} restore=${restoreIdx} nextMedia=${nextMediaIdx}`);

/* ---------- F2: designed wrap gap, split preserved ---------- */
check("F2 .footer-bottom wraps with the on-scale gap 12px 24px",
  /\.footer-bottom\s*\{[^}]*flex-wrap:\s*wrap;[^}]*gap:\s*12px 24px;/.test(clean));
check("F2 the single-row left/right split is untouched (space-between)",
  /\.footer-bottom\s*\{[^}]*justify-content:\s*space-between;/.test(clean));

/* ---------- F4: tap box grown, layout box unmoved ---------- */
check("F4 legal-row links carry padding: 4px 0 with compensating margin: -4px 0",
  /\.footer-bottom a\s*\{[^}]*padding:\s*4px 0;[^}]*margin:\s*-4px 0;/.test(clean));

/* ---------- F8: no aria-current in any footer; index keeps its two ---------- */
check("F8 no page's footer carries aria-current",
  htmls.every((h) => !/aria-current/.test(footOf(h))));
const index = htmls[PAGES.indexOf("index.html")];
check("F8 index keeps exactly its header + mobile-nav aria-current occurrences",
  (index.match(/aria-current="page"/g) || []).length === 2,
  `found ${(index.match(/aria-current="page"/g) || []).length}`);

/* ---------- chrome identity + the F3 retarget ---------- */
check("footer markup is byte-identical across all 11 pages",
  htmls.every((h) => footOf(h) === footOf(htmls[0])));
check("F3 the Billing link label is unchanged and now targets pricing.html on every page",
  htmls.every((h) => footOf(h).includes('<a href="pricing.html">Billing — via Paddle</a>')));
check("F3 no footer still links to the cancel FAQ anchor",
  htmls.every((h) => !footOf(h).includes("support.html#faq-b9")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
