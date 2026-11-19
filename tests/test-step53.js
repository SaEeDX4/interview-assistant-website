/* Step 53 — the support contact system (website side). The site
   carried real troubleshooting/FAQ copy but no way to reach anyone:
   zero email addresses, zero mailto links. Step 53 names the real
   channel — support@cybervalida.online (Cloudflare Email Routing to
   the owner) — as a contact card on the Support page with four
   subject-prefilled topic buttons, a footer link on all 11 pages,
   and the working channel for privacy requests on the Privacy page.
   Honesty rules: no response-time promise, no 24/7, no live chat,
   no ticket system — none existed in the copy before, and the ban
   is asserted site-wide so none can creep in.
   Step 55 (owner-ordered UX redesign) later slimmed the card to a
   one-line strip at the foot of the page and retired the four
   topic buttons — the assistant's contextual handoff composes
   the same subjects with transcript + diagnostics attached. The
   checks below were updated for placement only; every functional
   guarantee (address on the page, framing, footer, privacy
   channel, no fake claims) stands unchanged. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const PAGES = ["index.html", "features.html", "how-it-works.html", "demo.html",
  "pricing.html", "download.html", "platforms.html", "privacy.html",
  "terms.html", "support.html", "404.html"];
const html = {};
for (const f of PAGES) html[f] = fs.readFileSync(path.join(root, f), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

const ADDR = "support@cybervalida.online";
const MAILTO = `mailto:${ADDR}`;
const footOf = (h) => (h.match(/<footer[^>]*>[\s\S]*?<\/footer>/) || [""])[0];

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

// 1. Support page: the contact strip. Step 55 moved contact to
//    its research-backed place — a slim strip near the bottom,
//    after self-service (assistant, topics, FAQ, privacy) — and
//    the Troubleshooting prose section left the page (its
//    substance lives in the assistant's procedures).
const sup = html["support.html"];
const iContact = sup.indexOf("<h2>Contact us</h2>");
const iStrip = sup.indexOf('<div class="contact-strip">');
const iFaq = sup.indexOf("<h2>Frequently asked questions</h2>");
check("support: contact strip exists near the bottom, below the FAQ (Step 55 placement)",
  iContact !== -1 && iStrip !== -1 && iFaq !== -1 && iFaq < iContact && iContact < iStrip);
check("support: address shown as text and as a plain mailto link in the card",
  sup.includes(`<a href="${MAILTO}">${ADDR}</a>`));
check("support: honest framing — developer answers, what to include, no promise",
  sup.includes("Support is handled by the developer, by email:")
  && sup.includes("Please include your Windows version and what you were doing when the problem happened."));
check("support: the old 'no support email yet' placeholder is gone",
  !sup.includes("there is no support email yet") && !sup.includes("still to be decided"));

// 2. The four topic buttons left the page in Step 55: the
//    assistant's contextual email handoff replaces them — it
//    composes the same Step 53 subjects from the procedure the
//    visitor actually walked, and adds the transcript and the
//    diagnostics, which a bare pre-set subject never could.
//    Pinned here: the buttons are gone from the page, and the
//    bank still carries a procedure for every Step 53 subject,
//    with the handoff composing the subject at click time.
const subjects = {
  "Demo help": "demo%20help",
  "Privacy request": "privacy%20request",
  "Download question": "download%20question",
  "Something else": "support",
};
let buttonsGone = true;
for (const tail of Object.values(subjects)) {
  if (sup.includes(`${MAILTO}?subject=Interview%20Assistant%20%E2%80%94%20${tail}`)) buttonsGone = false;
}
check("support: the four topic mailto buttons are retired (Step 55 — the assistant handoff replaces them)",
  buttonsGone);
check("support: every Step 53 subject survives as an assistant procedure subject",
  js.includes('subject: "demo help"') && js.includes('subject: "privacy request"')
  && js.includes('subject: "download question"') && js.includes('subject: "support"')
  && js.includes('encodeURIComponent("Interview Assistant — " + state.lastSubject)'));

// 3. Footer: the address rides in the Resources nav of all 11 pages,
//    alongside the Support & FAQ link, in the neighbouring style.
let footOk = true, footNotes = [];
for (const f of PAGES) {
  const foot = footOf(html[f]);
  if (!foot.includes(`<a href="support.html">Support &amp; FAQ</a>\n      <a href="${MAILTO}">${ADDR}</a>`)) {
    footOk = false; footNotes.push(f);
  }
}
check("footer: support email link in the Resources nav on all 11 pages",
  footOk, footNotes.join(", "));

// 4. Privacy page: the address is the working channel for requests.
const priv = html["privacy.html"];
check("privacy: privacy-request mailto (subject prefilled) in the rights section",
  priv.includes(`Privacy requests go to <a href="${MAILTO}?subject=Interview%20Assistant%20%E2%80%94%20privacy%20request">${ADDR}</a>`));
check("privacy: the old 'support channel is still TBD' placeholder is gone",
  !priv.includes("still TBD"));

// 5. No fake-support claims anywhere in the site's text files.
let claimsOk = true, claimsNotes = [];
for (const f of PAGES) {
  if (/24\/7|live chat|ticket/i.test(html[f])) { claimsOk = false; claimsNotes.push(f); }
}
if (/24\/7|live chat|ticket/i.test(css)) { claimsOk = false; claimsNotes.push("styles.css"); }
if (/24\/7|live chat|ticket/i.test(js)) { claimsOk = false; claimsNotes.push("app.js"); }
check("no fake-support claims site-wide (no 24/7, no live chat, no ticket system)",
  claimsOk, claimsNotes.join(", "));

// 6. The CSS obeys the shape and spacing standards: the strip
//    is a hairline row (no capsule radii anywhere), and every
//    margin/padding value sits on the Step 9 scale.
const block = (css.match(/\/\* Step 53[\s\S]*?(?=\n\/\* |\n*$)/) || [""])[0];
const SCALE = new Set(["0", "4px", "8px", "12px", "16px", "20px", "24px", "28px",
  "32px", "40px", "48px", "56px", "64px", "72px", "96px"]);
let spacingOk = block.length > 0;
for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
  for (const v of m[1].trim().split(/\s+/)) if (!SCALE.has(v)) spacingOk = false;
}
check("step53 CSS: contact strip is a hairline row (Step 55 slimming), no capsule radius",
  block.includes(".contact-strip") && block.includes("border-top: 1px solid var(--border)")
  && !/999px|border-radius:\s*50%/.test(block));
check("step53 CSS: every margin/padding value is on the Step 9 scale", spacingOk);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
