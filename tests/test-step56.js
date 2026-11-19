/* Step 56 — Support upgrade pass (research round 2: symptom-first
   entries, zero-input state, resolution confirmation, APG
   combobox). These guards pin the new structure and its honesty
   rules: the status chip is empty until a real probe feeds it,
   a resolution counts only when confirmed, and the resume state
   lives in localStorage with a silent-degrade contract.
   Behaviour is pinned by sim-step56-assistant.js; Steps 53–55
   suites keep pinning the functions and the router structure. */
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

// 1. The combobox is a spec APG combobox in the markup: role,
//    autocomplete, the listbox as its controlled popup, and an
//    activedescendant slot the module drives.
check("combobox: input carries the APG combobox attributes",
  sup.includes('role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sa-results" aria-activedescendant=""'));
check("combobox: the results container is a labelled listbox, hidden at rest",
  sup.includes('<div class="sa-results" id="sa-results" role="listbox" aria-label="Search results" hidden></div>'));
check("combobox: a polite live region exists for result announcements",
  sup.includes('<p class="visually-hidden" id="sa-live" role="status" aria-live="polite"></p>'));

// 2. The state strip: present in the entry, both chips hidden
//    and EMPTY at rest — no status is ever printed before a
//    real probe runs, and no resume is offered before one is
//    saved.
check("state strip: strip, resume chip and status chip exist, hidden at rest",
  sup.includes('<div class="sa-state" id="sa-state" hidden>')
  && sup.includes('<button class="sa-resume" id="sa-resume" type="button" hidden></button>')
  && sup.includes('<span class="sa-status" id="sa-status" hidden></span>'));
check("state strip: no service status is claimed anywhere in the static page",
  !sup.includes("all reachable") && !sup.includes("systems normal"));

// 3. Symptom cards: seven cards in observable visitor words,
//    each wired to the procedure that actually treats it.
const cards = [...sup.matchAll(/<button class="symptom-card"[^>]*data-sa-topic="([a-z-]+)"[^>]*data-sa-label="([^"]+)"/g)];
check("symptoms: seven symptom cards with visitor-word labels",
  cards.length === 7, cards.map((c) => c[1]).join(","));
check("symptoms: each card targets its treating procedure",
  [["audio-none", "I can’t hear the interviewer"], ["audio-wrong", "It transcribes the wrong conversation"],
   ["signin", "Sign-in keeps looping"], ["minutes", "My minutes ran out"],
   ["download", "The download won’t start"], ["demo", "The demo gives no answer"],
   ["ethics", "It answers with facts I never gave"]]
    .every(([id, label]) => cards.some((c) => c[1] === id && c[2] === label)));
check("symptoms: the section asks the recognition question",
  sup.includes("<h2>What’s happening?</h2>")
  && sup.indexOf("<h2>What’s happening?</h2>") < sup.indexOf("<h2>Common topics</h2>"));

// 4. The module: previews for every bank procedure and FAQ,
//    resume persistence with its key, the confirmation loop,
//    the quiet probe, the APG keyboard machinery, the echo.
check("module: every bank procedure has a pre-authored preview",
  ["audio-none", "audio-wrong", "signin", "minutes", "download", "demo",
   "privacy", "pricing", "platforms", "offline", "ethics", "human"]
    .every((id) => js.includes(`"${id}": "`))
  && js.includes("var PREVIEWS =") && js.includes("var FAQ_PREVIEWS ="));
check("module: resume persists proc id + node under its own key",
  js.includes('var RESUME_KEY = "ia-sa-resume"')
  && js.includes("function saveResume()") && js.includes("function clearResume()")
  && js.includes("function resumeSaved()") && js.includes("function showResumeChip()"));
check("module: storage failures degrade silently (guarded access)",
  js.includes('typeof localStorage !== "undefined"'));
check("module: the confirmation loop branches on confirm-yes / confirm-no",
  js.includes('"confirm-yes"') && js.includes('"confirm-no"')
  && js.includes("Did that fix it?") && js.includes("Confirmed — glad it's sorted"));
check("module: the status chip is fed by probes, quietly and in full runs",
  js.includes("function updateStatusChip(results)") && js.includes("function quietProbe()")
  && js.includes("Services: all reachable just now"));
check("module: APG keyboard machinery (active option + activation)",
  js.includes("function setActive(idx)") && js.includes("function activateOption(idx)")
  && js.includes("aria-activedescendant") && js.includes("function announce(msg)"));
check("module: the no-result reply echoes the visitor's words",
  js.includes("You asked: “") && js.includes("openResponse(scored.slice(0, 2), text)"));
/* Step 58 annotation: the symptom wiring now passes
   reveal=true (the cards sit below the panel, so the module
   makes its one managed scroll after expanding). */
check("module: symptom cards share the topic wiring",
  js.includes("wireTopicButtons(symptomsEl, true)"));

// 5. CSS: the Step 56 block — strip guards, symptom grid, the
//    active-option state — on the house scales, no capsules.
const block = (css.match(/\/\* Step 56 — Support upgrade pass[\s\S]*$/) || [""])[0];
check("css step56: hidden guards for strip and both chips",
  block.includes(".sa-state[hidden] { display: none; }")
  && block.includes(".sa-resume[hidden] { display: none; }")
  && block.includes(".sa-status[hidden] { display: none; }"));
check("css step56: symptom grid is two calm columns, one on phones",
  block.includes(".symptom-grid") && block.includes("repeat(2, 1fr)")
  && block.includes(".symptom-grid { grid-template-columns: 1fr; }"));
check("css step56: cards and chips stay in the radius family (no 999px)",
  block.length > 0 && !block.includes("999px")
  && block.includes(".symptom-card") && block.includes("border-radius: var(--radius)"));
check("css step56: the active combobox option has a visible state",
  block.includes(".sa-result-active"));
const SCALE = new Set(["0", "4px", "8px", "12px", "16px", "20px", "24px", "28px",
  "32px", "40px", "48px", "56px", "64px", "72px", "96px"]);
let spacingOk = block.length > 0;
for (const m of block.matchAll(/(?:margin|padding)(?:-[a-z]+)?\s*:\s*([^;]+);/g)) {
  for (const v of m[1].trim().split(/\s+/)) if (!SCALE.has(v)) spacingOk = false;
}
check("css step56: every margin/padding value is on the Step 9 scale", spacingOk);
const LINE_HEIGHTS = new Set(["1", "1.04", "1.12", "1.3", "1.4", "1.5", "1.6", "1.65"]);
let lhOk = block.length > 0;
for (const m of block.matchAll(/line-height:\s*([0-9.]+)/g)) {
  if (!LINE_HEIGHTS.has(m[1])) lhOk = false;
}
check("css step56: every line-height is on the typography standard", lhOk);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
