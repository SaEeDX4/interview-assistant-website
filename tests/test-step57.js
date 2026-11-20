/* Step 57 — Contextual help entries (research: floating-chat
   report, middle paths A–D). One quiet help block on each of
   the demo, download and pricing pages, at the point where
   failure actually happens, routing to the ONE assistant via a
   topic deep link — no floating bubble, no second help system,
   no mailto in the blocks. These guards pin the blocks, the
   deep-link contract, the origin seeding, and the two
   state-driven variants (download manifest state, demo
   live-answer fallback), which must be fed only by real page
   state. Behaviour is pinned by sim-step57-help.js. */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "website");
const demo = fs.readFileSync(path.join(root, "demo.html"), "utf8");
const dl = fs.readFileSync(path.join(root, "download.html"), "utf8");
const pricing = fs.readFileSync(path.join(root, "pricing.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, extra); }
}
function blockOf(html, id) {
  const i = html.indexOf(`id="${id}"`);
  if (i < 0) { return ""; }
  const start = html.lastIndexOf("<div", i);
  const end = html.indexOf("</a>", i);
  return html.slice(start, end < 0 ? i + 400 : end + 4);
}

// 1. One block per page, one consistent pattern: the page's
//    failures named in one line, one labelled action, and the
//    action is the assistant deep link for that page's topic.
const BLOCKS = [
  { html: demo, id: "demo-help", topic: "demo", action: "Get help with the demo" },
  { html: dl, id: "download-help", topic: "download", action: "Get help with downloads" },
  { html: pricing, id: "pricing-help", topic: "pricing", action: "Get help with pricing" },
];
for (const b of BLOCKS) {
  const block = blockOf(b.html, b.id);
  check(`block ${b.topic}: exactly one help block on the page`,
    (b.html.match(/class="help-block"/g) || []).length === 1);
  check(`block ${b.topic}: one action, the deep link to its topic`,
    block.includes(`<a class="btn btn-secondary" href="support.html?topic=${b.topic}">${b.action}</a>`));
  check(`block ${b.topic}: routes to the assistant, never to mailto`,
    block.length > 0 && !block.includes("mailto:"));
  check(`block ${b.topic}: a real heading names the trouble`,
    /<h2 class="help-block-title">[^<]+<\/h2>/.test(block));
}

// 2. Placement: beside the failure point on each page — after
//    the demo player, after the platform cards on download,
//    after the plan comparison on pricing.
check("placement demo: the block follows the demo player, before the next-step card",
  demo.indexOf('id="demo-help"') > demo.indexOf('id="demo"')
  && demo.indexOf('id="demo-help"') < demo.indexOf('id="demo-next"'));
check("placement download: the block follows the platform cards, before What's new",
  dl.indexOf('id="download-help"') > dl.indexOf('id="dl-platforms"')
  && dl.indexOf('id="download-help"') < dl.indexOf('id="dl-whatsnew"'));
check("placement pricing: the block closes the plans section, after the comparison",
  pricing.indexOf('id="pricing-help"') > pricing.indexOf('class="compare"')
  && pricing.indexOf('id="pricing-help"') < pricing.indexOf('id="plan-finder"'));

// 3. The state notes exist, hidden at rest, on the two pages
//    with a real signal — and their copy claims only the state
//    the page's module can actually know.
check("state note download: present, hidden at rest, claims the rendered state only",
  dl.includes('<p class="help-block-note" id="dl-help-state" hidden>')
  && dl.includes("no installer is published"));
check("state note demo: present, hidden at rest, describes the fallback it reports",
  demo.includes('<p class="help-block-note" id="demo-help-note" hidden>')
  && demo.includes("the live answer did not come back"));
check("state note pricing: none — the pricing page has no live signal to report",
  !pricing.includes("help-block-note"));

// 4. The deep-link contract in the assistant module: the three
//    topics map to the three existing procedures and their
//    origin pages; the parameter is read once from
//    location.search; an unknown topic returns without
//    touching the rest state.
const saStart = js.indexOf("/* Step 54");
const sa = saStart >= 0 ? js.slice(saStart) : "";
check("deep link: the topic map covers demo, download and pricing",
  sa.includes('demo: { proc: "demo", label: "Demo help", page: "demo.html" }')
  && sa.includes('download: { proc: "download", label: "Download problems", page: "download.html" }')
  && sa.includes('pricing: { proc: "pricing", label: "Pricing", page: "pricing.html" }'));
check("deep link: the parameter is read from location.search, guarded",
  sa.includes('typeof location.search === "string"')
  && sa.includes("/[?&]topic=([a-z]+)/"));
check("deep link: an unknown or absent topic leaves the rest state untouched",
  sa.includes("if (!key || !TOPIC_LINKS[key]) { return; }")
  && sa.includes("function arriveFromTopic()") && sa.includes("arriveFromTopic();"));
check("deep link: arrival replays the topic path (expand, bubble, procedure)",
  sa.includes("state.origin = { page: link.page, label: link.label };")
  && sa.includes("addUserBubble(link.label);"));

// 5. Origin seeding reaches the handoff: the diagnostics
//    context line and the prepared email both name the page
//    the visitor started from; without an origin both keep
//    their Step 54 wording exactly.
check("origin: the state starts empty and the context line appends it when set",
  sa.includes("origin: null")
  && sa.includes('(state.origin ? " · Arrived from: " + state.origin.page : "")'));
check("origin: the prepared email names the origin page",
  sa.includes('"- Started from: " + state.origin.page'));

// 6. The state variants are wired to real page state only:
//    the download line follows the manifest result on every
//    branch (rendered release excluded), and the demo flag is
//    set only on the live-answer failure path and cleared on
//    a successful one.
const dlMod = js.slice(js.indexOf("/* Step 41"), js.indexOf("/* Step 25"));
check("download state: the module reads the note element and has one marker",
  dlMod.includes('document.getElementById("dl-help-state")')
  && dlMod.includes("function markNoRelease()"));
check("download state: no-release is marked on the empty-manifest and failure branches",
  dlMod.includes("else { markNoRelease(); }")
  && dlMod.includes(".catch(function () { markNoRelease();"));
check("demo state: the flag helper exists and reads both block elements",
  js.includes("function setDemoHelpFlag(on)")
  && js.includes('document.getElementById("demo-help")')
  && js.includes('document.getElementById("demo-help-note")'));
check("demo state: the flag is set on the AI failure path and cleared on success",
  js.includes("showAnswer(\"typed\", text, null);\n      setDemoHelpFlag(true);")
  && js.includes("setDemoHelpFlag(false);"));

// 7. CSS: the Step 57 block — one card pattern in the radius
//    family, the alert frame, the hidden guard — on the house
//    scales, with no fixed/sticky positioning anywhere in it.
/* Step 59 annotation: slice bounded at the Step 59 block (see
   test-step54.js) — the Step 57/58 CSS is still fully scanned;
   "never sticky" governs the help blocks, not the Features page. */
const block = (css.match(/\/\* Step 57 — Contextual help entries[\s\S]*?(?=\/\* -+ Step 59|$)/) || [""])[0];
check("css step57: the card pattern is defined at the family radius",
  block.includes(".help-block {") && block.includes("border-radius: var(--radius)")
  && block.includes(".help-block-title") && block.includes(".help-block-line"));
check("css step57: the alert frame and the note's hidden guard exist",
  block.includes(".help-block.is-alert { border-color: var(--warn); }")
  && block.includes(".help-block-note[hidden] { display: none; }"));
check("css step57: never a banner, popup or sticky element",
  block.length > 0 && !/position:\s*(fixed|sticky|absolute)/.test(block)
  && !block.includes("999px"));
const SCALE = new Set(["0", "4px", "8px", "12px", "16px", "20px", "24px", "28px",
  "32px", "40px", "48px", "56px", "64px", "72px", "96px"]);
let spacingOk = block.length > 0;
for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
  for (const v of m[1].trim().split(/\s+/)) if (!SCALE.has(v)) spacingOk = false;
}
check("css step57: every margin/padding value is on the Step 9 scale", spacingOk);
check("css step57: the reduced-motion block count is untouched by this step",
  (css.match(/prefers-reduced-motion/g) || []).length >= 3 && !block.includes("prefers-reduced-motion"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
