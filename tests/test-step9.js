/* Step 9 — absolute spacing standard. Run: node tests/test-step9.js
   (from ~/workspace/interview-assistant-website).
   The standard (SPACING.md): every margin, padding and gap in styles.css
   must be on the scale 4/8/12/16/20/24/28/32/40/48/56/64/72/96, or one of
   the documented exemptions (1px optical alignment on .num/.mk markers,
   3px waveform-bar gap in .app-wave, -10px slider-thumb centring offset,
   -1px visually-hidden offset).
   Step 83 exemption: inside the app-window depiction family
   (.app-card, .app-window-body, .demo-body, .feat-mini-card selectors),
   the app's own geometry — 10px inter-card gap, 14px body inset,
   18px card padding (MainWindow.xaml: LiveBody margin 14, QuestionCard
   margin-bottom 10, S.CardPadding 18,14) — is exempt from the scale:
   the owner's order is that the website's window matches the app's
   window exactly, so the app's values win inside the window only.
   This test parses the stylesheet and
   fails on any other value — the standard is enforced, not aspirational.
   Step 9 also fixed the one visible violation the audit found: the gap
   between the page hero and the first content section was 32px, not the
   standard 48px (R3). */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

const SCALE = new Set([4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 96]);
const SPACING_PROPS = new Set([
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "gap", "row-gap", "column-gap",
]);

// 1. Scale enforcement: strip comments, walk every rule block, check every
//    margin/padding/gap value. (Media-query inner rules are matched as their
//    own blocks; scroll-margin/scroll-padding and heights are not spacing.)
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
const violations = [];
const blockRe = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = blockRe.exec(clean)) !== null) {
  const selector = m[1].trim().replace(/\s+/g, " ");
  const body = m[2];
  for (const decl of body.split(";")) {
    const colon = decl.indexOf(":");
    if (colon < 0) continue;
    const prop = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!SPACING_PROPS.has(prop) || !value || value.includes("calc(")) continue;
    if (/em|rem|%/.test(value)) {
      violations.push(`${selector} :: ${prop}: ${value} (non-px unit)`);
      continue;
    }
    for (const num of value.match(/\d+(?:\.\d+)?(?=px)/g) || []) {
      const v = Number(num);
      const exempt = (v === 1 && /\.num|\.mk|\.visually-hidden/.test(selector))
        || (v === 3 && selector.includes(".app-wave"))
        || (v === 10 && selector.includes("::-webkit-slider-thumb"))
        || ((v === 10 || v === 14 || v === 18)
            && /\.app-card|\.app-window-body|\.demo-body|\.feat-mini-card/.test(selector));
      if (!SCALE.has(v) && !exempt) {
        violations.push(`${selector} :: ${prop}: ${value} (off-scale ${v}px)`);
      }
    }
  }
}
check("every margin/padding/gap is on the scale (or a documented exemption)",
  violations.length === 0, violations.slice(0, 10).join(" | "));

// 2. P0 fix: hero -> first content section is now 48px total (R3).
check("R3 hero->content gap: page-hero bottom 8px + section top 40px = 48px",
  /\.page-hero\s*\{[^}]*padding:\s*48px 0 8px/s.test(css)
  && /\.page-hero\s*\+\s*\.section\s*\{\s*padding-top:\s*40px;\s*\}/.test(css));

// 3. Key standard values (spot checks across the rules).
check("R1 section padding 72px (64px mobile)",
  /\.section\s*\{\s*padding:\s*72px 0;\s*\}/.test(css)
  && /\.section\s*\{\s*padding:\s*64px 0;\s*\}/.test(css));
check("R9 card padding 28px", /\.card\s*\{[^}]*padding:\s*28px;/s.test(css));
check("R10 card icon -> title 16px", /\.icon\s*\{[^}]*margin-bottom:\s*16px;/s.test(css));
check("R14 primary button 12px 24px",
  /display:\s*inline-block;\s*padding:\s*12px 24px;\s*border-radius:\s*12px;/.test(css));
check("R7 eyebrow -> heading 12px",
  /margin-bottom:\s*12px;\s*\n\s*\}/.test(css) || /color:\s*var\(--muted\);\s*margin-bottom:\s*12px;/.test(css));
check("R20 footer link rows 12px vertical (Step 11: 44px touch target)",
  /\.site-footer nav a\s*\{[^}]*padding:\s*12px 0;/s.test(css));
check("R11 flow-node padding 20px, icon -> title 12px",
  /\.flow-node[^{]*\{[^}]*padding:\s*20px;/s.test(css)
  && /margin:\s*0 auto 12px;/.test(css));
/* Step 55 annotation: the .trouble-card sample left this check
   with the troubleshooting cards — removed by the owner-ordered
   support UX redesign (substance moved into the assistant's
   procedures). The 24px small-card standard stays pinned on
   .req-item, and the generic scale scan above still covers
   every margin/padding/gap in the sheet. */
check("R9 small cards padding 24px",
  /\.req-item\s*\{[^}]*padding:\s*24px;/s.test(css));
check("sticky CTA gap 12px, 16px side padding, no 56px reserve (Step 27)",
  /gap:\s*12px;\s*padding:\s*12px 16px 12px 20px;/.test(css));

// 4. Step 8 regression: section rhythm still in force.
check("step8 rhythm: h2 48px / h3 28px still present",
  /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h2[^{]*\{[^}]*margin-top:\s*48px/s.test(css)
  && /\.section\s*>\s*\.container:not\(\.doc\)\s*>\s*h3[^{]*\{[^}]*margin-top:\s*28px/s.test(css));

// 5. Step 6/7 smoke: earlier fixes still present.
check("step7 code token rule still present", /code\s*\{\s*overflow-wrap:\s*anywhere;\s*\}/.test(css));
check("step6 pipe-list 1fr rule still present",
  /@media\s*\(max-width:\s*640px\)\s*\{\s*\.pipe-list\s*\{\s*grid-template-columns:\s*1fr;\s*\}\s*\}/.test(css));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
