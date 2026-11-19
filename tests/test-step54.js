/* Step 54 — Support Assistant, Phase 1. The assistant becomes the
   Support page's primary experience: a procedures engine over a
   curated bank built only from the page's own playbooks, real live
   diagnostics against the site's own services, and a prepared
   email handoff. These guards pin the structure: the panel and its
   wiring points, the bank's integrity (enough procedures, every
   one with a defined exit), the never-a-dead-end rules (no
   "I don't know", no promised-but-unwired capability), the mailto
   composition, and the shape/spacing/typography standards for the
   new CSS. Behaviour is pinned by sim-step54-assistant.js. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const sup = fs.readFileSync(path.join(root, "support.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}

const sliceStart = js.indexOf("/* Step 54");
const mod = sliceStart === -1 ? "" : js.slice(sliceStart);
const htmlBlock = (sup.match(/<div class="sa" id="support-assistant">[\s\S]*?\n      <\/div>\n/) || [""])[0];

// 1. The panel: present, wired, and the page's primary experience —
//    above the Step 53 contact section (a card in Step 54's day;
//    Step 55 slimmed it to the bottom strip, same order).
const iAssist = sup.indexOf('<h2>Support assistant</h2>');
const iContact = sup.indexOf("<h2>Contact us</h2>");
check("support: assistant section exists above the contact section",
  iAssist !== -1 && iContact !== -1 && iAssist < iContact);
check("support: panel carries every wiring point the module needs",
  ["support-assistant", "sa-log", "sa-form", "sa-input", "sa-topics", "sa-check-btn"]
    .every((id) => sup.includes(`id="${id}"`)));
check("support: the log is an aria-live conversation region",
  sup.includes('id="sa-log" role="log" aria-live="polite"'));
/* Step 55 annotation: the entry is a search-style router now, so
   the label is visible (it is the page's one starting
   instruction: "Describe your problem") instead of visually
   hidden, and the submit reads "Ask" instead of "Send". The
   guarantee is unchanged: a real <label for> and a real submit
   button. */
check("support: the form has a real label and a submit button",
  sup.includes('<label class="sa-label" for="sa-input">Describe your problem</label>')
  && sup.includes('<button class="btn btn-primary btn-small" type="submit">Ask</button>'));

// 2. Topic chips mirror bank procedures, one for one.
const chipIds = [...sup.matchAll(/data-sa-topic="([a-z-]+)"/g)].map((m) => m[1]);
const bankIds = [...mod.matchAll(/\n      id: "([a-z-]+)",/g)].map((m) => m[1]);
check("bank: at least 8 procedures are defined", bankIds.length >= 8, bankIds.join(","));
check("topics: every chip names a real bank procedure",
  chipIds.length >= 6 && chipIds.every((id) => bankIds.includes(id)), chipIds.join(","));

// 3. Bank integrity: every procedure carries a defined way out —
//    a resolution, a diagnostics run, or the email handoff — so no
//    path through the bank can dead-end.
const blocks = mod.split(/\n      id: "/).slice(1);
const exitless = blocks.filter((b) => !/exit: "resolved"|action: "(diagnostics|email)"/.test(b));
check("bank: every procedure has a defined exit (resolved / diagnostics / email)",
  blocks.length === bankIds.length && exitless.length === 0,
  exitless.length + " exitless");

// 4. The never-dead-end voice: no "I don't know" anywhere in the
//    assistant's strings, and no capability promised that Phase 1
//    does not wire (no AI chat, no live chat, no tickets, no 24/7).
check("assistant never says it doesn't know (module + panel)",
  !/don'?t know|do not know/i.test(mod) && !/don'?t know|do not know/i.test(htmlBlock));
const modStrings = mod.slice(mod.indexOf("*/") + 2); // rendered strings, not the header comment
check("no unwired capability is promised (rendered strings + panel)",
  !/live chat|ticket|24\/7|cmd\+k|command palette/i.test(modStrings)
  && !/live chat|ticket|24\/7/i.test(htmlBlock));

// 5. The handoff: a mailto composed with encodeURIComponent to the
//    Step 53 address, carrying asked/covered/diagnostics/context.
check("handoff: mailto composed to the support address with encoded subject and body",
  mod.includes('var SUPPORT_ADDR = "support@cybervalida.online"')
  && mod.includes('"mailto:" + SUPPORT_ADDR')
  && mod.includes('encodeURIComponent("Interview Assistant — " + state.lastSubject)')
  && mod.includes("encodeURIComponent(body)"));
check("handoff: the body carries the conversation, the check and the context",
  mod.includes("What I asked:") && mod.includes("Playbooks covered:")
  && mod.includes("System check (") && mod.includes("My Windows version and what I was doing:"));

// 6. Diagnostics probe the site's real services — the shared
//    endpoint constants and the growth document — nothing invented.
check("diagnostics: probes use the real release, growth and AI endpoints",
  mod.includes("IA_RELEASES_ENDPOINT") && mod.includes("IA_AI_ENDPOINT")
  && mod.includes('"https://admin.cybervalida.online/growth"')
  && mod.includes('"demo.html"'));
check("diagnostics: our-side failures are attributed to us, in words",
  mod.includes("This part is on our side:"));

// 7. Curated FA/AR entry sets exist for the top topics, with the
//    human-written lead lines and RTL rendering.
check("i18n: curated Persian and Arabic triggers and leads are in the bank",
  mod.includes('faKeys: ["صدا"') && mod.includes('arKeys: ["صوت"')
  && mod.includes("var FA_LEAD =") && mod.includes("var AR_LEAD =")
  && mod.includes('"sa-rtl"'));

// 8. Placement law: the module sits after the first IIFE literal
//    (the Step 30 slicing trap) and renders textContent-only.
check("module: appended after the first (function () { in app.js",
  sliceStart > js.indexOf("(function () {"));
check("module: textContent-only rendering (no innerHTML)",
  !mod.includes("innerHTML"));

// 9. CSS: the Step 54 block obeys the shape, spacing and type
//    standards — panel at --radius, small controls at 8px, the
//    only 50% radius is the exempt status dot, spacing on scale,
//    line-heights on the typography set.
const block = (css.match(/\/\* Step 54[\s\S]*$/) || [""])[0];
check("step54 CSS: block exists with the panel at --radius (12px)",
  block.includes(".sa {") && block.includes("border-radius: var(--radius)"));
check("step54 CSS: no capsule radius; 50% only on the status dot",
  !block.includes("999px")
  && [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[2].includes("border-radius: 50%"))
    .every((m) => m[1].includes(".sa-dot")));
const SCALE = new Set(["0", "4px", "8px", "12px", "16px", "20px", "24px", "28px",
  "32px", "40px", "48px", "56px", "64px", "72px", "96px"]);
let spacingOk = block.length > 0;
for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
  for (const v of m[1].trim().split(/\s+/)) if (!SCALE.has(v)) spacingOk = false;
}
check("step54 CSS: every margin/padding value is on the Step 9 scale", spacingOk);
const LINE_HEIGHTS = new Set(["1", "1.04", "1.12", "1.3", "1.4", "1.5", "1.6", "1.65"]);
let lhOk = block.length > 0;
for (const m of block.matchAll(/line-height:\s*([0-9.]+)/g)) {
  if (!LINE_HEIGHTS.has(m[1])) lhOk = false;
}
for (const m of block.matchAll(/font:\s*\S+\s+\d+px\/([0-9.]+)/g)) {
  if (!LINE_HEIGHTS.has(m[1])) lhOk = false;
}
check("step54 CSS: every line-height is on the typography standard", lhOk);
check("step54 CSS: the rise curve keeps the house spelling",
  !block.includes("cubic-bezier(.2, .7") && block.includes("cubic-bezier(.2,.7,.3,1)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
